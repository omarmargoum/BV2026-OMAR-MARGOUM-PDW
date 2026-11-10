import {
  Injectable,
} from '@nestjs/common';

import {
  DataSource,
} from 'typeorm';

import {
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  LogoutRequestDto,
  LogoutResponseDto,
} from '../data/index.js';

import {
  AuthTokenService,
} from './auth-token.service.js';

@Injectable()
export class LogoutService {
  constructor(
    private readonly dataSource:
      DataSource,

    private readonly authTokenService:
      AuthTokenService,
  ) {}

  async logout(
    input: LogoutRequestDto,
  ): Promise<LogoutResponseDto> {
    const tokenHash =
      this.authTokenService
        .hashRefreshToken(
          input.refreshToken,
        );

    await this.dataSource.transaction(
      async (
        transactionalManager,
      ): Promise<void> => {
        const refreshTokenRepository =
          transactionalManager.getRepository(
            AuthRefreshTokenEntity,
          );

        const sessionRepository =
          transactionalManager.getRepository(
            AuthSessionEntity,
          );

        const refreshToken =
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
                tokenHash,
              },
            )
            .getOne();

        /*
         * La déconnexion reste volontairement
         * idempotente. Un token inconnu ne révèle
         * aucune information au client.
         */
        if (!refreshToken) {
        return;
        }

        const session =
          await sessionRepository
            .createQueryBuilder('session')
            .setLock('pessimistic_write')
            .where(
              'session.id = :sessionId',
              {
                sessionId:
                  refreshToken.sessionId,
              },
            )
            .getOne();

        const now = new Date();

        await refreshTokenRepository
          .createQueryBuilder()
          .update(AuthRefreshTokenEntity)
          .set({
            revokedAt: now,
          })
          .where(
            'session_id = :sessionId',
            {
            sessionId:
                refreshToken.sessionId,
            },         )
          .andWhere(
         'revoked_at IS NULL',
        )
          .execute();

     if (
          session &&
      !session.revokedAt
        ){
          session.revokedAt = now;

          await sessionRepository.save(
            session,
        );
        }
      },
    );

  const response =
      new LogoutResponseDto();

    response.loggedOut = true;

    return response; }
}
