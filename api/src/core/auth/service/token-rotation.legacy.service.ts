import {
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import {
  DataSource,
 
} from 'typeorm';
import type{
    Repository,
} from 'typeorm'
import {
  ApiCodeResponse,
  ApiException,
} from '../../../common/api/index.js';

import {
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  RefreshRequestDto,
  RefreshResponseDto,
} from '../data/index.js';

import {
  AuthTokenService,
} from './auth-token.service.js';

type RotationResult =
  | {
      status: 'success';
      response: RefreshResponseDto;
    }
  | {
      status: 'invalid';
    }
  | {
      status: 'reuse-detected';
    };

@Injectable()
export class TokenRotationService {
  constructor(
    private readonly dataSource:
      DataSource,

    private readonly authTokenService:
      AuthTokenService,
  ) {}

  async rotate(
    input: RefreshRequestDto,
  ): Promise<RefreshResponseDto> {
    const currentTokenHash =
      this.authTokenService
        .hashRefreshToken(
          input.refreshToken,
        );

    const result =
      await this.dataSource.transaction(
        async (
          transactionalManager,
        ): Promise<RotationResult> => {
          const refreshTokenRepository =
            transactionalManager.getRepository(
              AuthRefreshTokenEntity,
            );

          const sessionRepository =
            transactionalManager.getRepository(
              AuthSessionEntity,
            );

          const currentToken =
            await refreshTokenRepository
              .createQueryBuilder(
                'refreshToken',
              )
              .addSelect(
                'refreshToken.tokenHash',
              )
              .setLock(
                'pessimistic_write',
              )
              .where(
                'refreshToken.tokenHash = :tokenHash',
                {
                  tokenHash:
                    currentTokenHash,
                },
              )
              .getOne();

          /*
           * Token inconnu :
           * aucune session identifiable,
           * donc aucune révocation possible.
           */
          if (!currentToken) {
            return {
              status: 'invalid',
            };
          }

          /*
           * Un token déjà utilisé ou remplacé
           * est une réutilisation suspecte.
           */
          if (
            currentToken.usedAt ||
            currentToken.replacedByTokenId
          ) {
            await this.revokeSessionFamily(
              currentToken.sessionId,
              refreshTokenRepository,
              sessionRepository,
            );

            return {
              status:
                'reuse-detected',
            };
          }

          /*
           * Un token explicitement révoqué
           * ou expiré est simplement invalide.
           */
          if (
            currentToken.revokedAt ||
            currentToken.expiresAt
              .getTime() <= Date.now()
          ) {
            return {
              status: 'invalid',
            };
          }

          const session =
            await sessionRepository
              .createQueryBuilder(
                'session',
              )
              .setLock(
                'pessimistic_write',
              )
              .where(
                'session.id = :sessionId',
                {
                  sessionId:
                    currentToken.sessionId,
                },
              )
              .getOne();

          if (
            !session ||
            session.revokedAt ||
            session.expiresAt
              .getTime() <= Date.now()
          ) {
            return {
              status: 'invalid',
            };
          }

          const tokenPair =
            await this.authTokenService
              .generateTokenPair(
                session.accountId,
                session.id,
              );

          const replacementToken =
            refreshTokenRepository.create({
              sessionId:
                session.id,

              tokenHash:
                tokenPair
                  .refreshTokenHash,

              expiresAt:
                tokenPair
                  .refreshTokenExpiresAt,

              usedAt: null,
              revokedAt: null,

              replacedByTokenId:
                null,
            });

          const savedReplacementToken =
            await refreshTokenRepository
              .save(
                replacementToken,
              );

          currentToken.usedAt =
            new Date();

          currentToken.replacedByTokenId =
            savedReplacementToken.id;

          await refreshTokenRepository.save(
            currentToken,
          );

          session.lastSeenAt =
            new Date();

          await sessionRepository.save(
            session,
          );

          const response =
            new RefreshResponseDto();

          response.accessToken =
            tokenPair.accessToken;

          response
            .accessTokenExpiresInSeconds =
            tokenPair
              .accessTokenExpiresInSeconds;

          response.refreshToken =
            tokenPair.refreshToken;

          response.refreshTokenExpiresAt =
            tokenPair
              .refreshTokenExpiresAt
              .toISOString();

          return {
            status: 'success',
            response,
          };
        },
      );

    if (
      result.status ===
      'reuse-detected'
    ) {
      throw this
        .createReuseDetectedException();
    }

    if (
      result.status ===
      'invalid'
    ) {
      throw this
        .createInvalidTokenException();
    }

    return result.response;
  }

  private async revokeSessionFamily(
  sessionId: string,
  refreshTokenRepository:
    Repository<AuthRefreshTokenEntity>,
  sessionRepository:
    Repository<AuthSessionEntity>,
): Promise<void> {
  const now = new Date();

  await refreshTokenRepository
    .createQueryBuilder()
    .update(
      AuthRefreshTokenEntity,
    )
    .set({
      revokedAt: now,
    })
    .where(
      'session_id = :sessionId',
      {
        sessionId,
      },
    )
    .andWhere(
      'revoked_at IS NULL',
    )
    .execute();

  const session =
    await sessionRepository
      .createQueryBuilder(
        'session',
      )
      .setLock(
        'pessimistic_write',
      )
      .where(
        'session.id = :sessionId',
        {
          sessionId,
        },
      )
      .getOne();

  if (
    session &&
    !session.revokedAt
  ) {
    session.revokedAt = now;

    await sessionRepository.save(
      session,
    );
  }
}

  private createInvalidTokenException():
    ApiException<null> {
    return new ApiException<null>({
      statusCode:
        HttpStatus.UNAUTHORIZED,

      code:
        ApiCodeResponse
          .AuthRefreshTokenInvalid,

      data: null,

      logMessage:
        'Refresh token validation failed',
    });
  }

  private createReuseDetectedException():
    ApiException<null> {
    return new ApiException<null>({
      statusCode:
        HttpStatus.UNAUTHORIZED,

      code:
        ApiCodeResponse
          .AuthRefreshTokenReuseDetected,

      data: null,

      logMessage:
        'Refresh token reuse was detected and the session was revoked',
    });
  }
}
