import {
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import {
  DataSource,
} from 'typeorm';

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
} from '../token/index.js';

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

    return this.dataSource.transaction(
      async (
        transactionalManager,
      ): Promise<RefreshResponseDto> => {
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

        if (
          !currentToken ||
          currentToken.usedAt ||
          currentToken.revokedAt ||
          currentToken.expiresAt
            .getTime() <= Date.now()
        ) {
          throw this
            .createInvalidTokenException();
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
          throw this
            .createInvalidTokenException();
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

        return response;
      },
    );
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
}