import {
  ConflictException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  DataSource,
  QueryFailedError,
  type Repository,
} from 'typeorm';

import {
  ApiCodeResponse,
  ApiException,
} from '../../../common/api/index.js';

import {
  AccountEntity,
  AccountResponseDto,
  AccountStatus,
} from '../../account/data/index.js';

import {
  AuthIdentifierEntity,
  AuthIdentifierType,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  LogoutResponseDto,
  PasswordCredentialEntity,
  RefreshRequestDto,
  RefreshResponseDto,
  RegisterRequestDto,
} from '../data/index.js';
import type {
  AuthenticatedSession,
} from '../data/model/auth-context.js';
import {
  AuthIdentifierService,
} from './auth-identifier.service.js';

import {
  AuthSessionService,
  type CreateSessionOptions,
} from './auth-session.service.js';
type LoginSessionOptions =
  Omit<
    CreateSessionOptions,
    'csrfTokenHash'
  >;
import {
  normalizeEmail,
} from '../utils/normalize-email.util.js';
import {
  PasswordCredentialService,
} from './password-credential.service.js';

import {
  PasswordHasherService,
} from './password-hasher.service.js';
import {
  PasswordPolicyService,
} from './password-policy.service.js';
import {
  RefreshTokenService,
} from './refresh-token.service.js';

import {
  TokenCryptoService,
} from './token-crypto.service.js';

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
export class AuthService {
  constructor(
    @InjectRepository(
      AccountEntity,
    )
    private readonly accountRepository:
      Repository<AccountEntity>,

    private readonly dataSource:
      DataSource,

    private readonly authIdentifierService:
      AuthIdentifierService,

    private readonly authSessionService:
      AuthSessionService,

    private readonly passwordCredentialService:
      PasswordCredentialService,

    private readonly passwordHasherService:
      PasswordHasherService,
    private readonly passwordPolicyService:
      PasswordPolicyService,
    private readonly refreshTokenService:
      RefreshTokenService,

    private readonly tokenCryptoService:
      TokenCryptoService,
  ) {}

  async register(
    input:
      RegisterRequestDto,
  ): Promise<AccountResponseDto> {
     const normalizedEmail =
                normalizeEmail(
                input.email,
            );   
            this.passwordPolicyService
            .assertValid(
            input.password,
            );
    const passwordHash =
      await this.passwordHasherService
        .hashPassword(
          input.password,
        );

    try {
      const account =
        await this.dataSource
          .transaction(
            async (
              transactionalManager,
            ): Promise<AccountEntity> => {
              const identifierRepository =
                transactionalManager
                  .getRepository(
                    AuthIdentifierEntity,
                  );

              const existingIdentifier =
                await identifierRepository
                  .findOne({
                    where: {
                      type:
                        AuthIdentifierType
                          .Email,

                      normalizedValue:
                        normalizedEmail,
                    },
                  });

              if (
                existingIdentifier
              ) {
                throw new ConflictException();
              }

              const accountRepository =
                transactionalManager
                  .getRepository(
                    AccountEntity,
                  );

              const credentialRepository =
                transactionalManager
                  .getRepository(
                    PasswordCredentialEntity,
                  );

              const accountEntity =
                accountRepository
                  .create({
                    status:
                      AccountStatus
                        .Pending,
                  });
                
              const savedAccount =
                await accountRepository
                  .save(
                    accountEntity,
                  );

              const identifier =
                identifierRepository
                  .create({
                    accountId:
                      savedAccount.id,

                    type:
                      AuthIdentifierType
                        .Email,

                    value:
                      input.email.trim(),

                    normalizedValue:
                      normalizedEmail,

                    verifiedAt:
                      null,
                      
                  });

              await identifierRepository
                .save(
                  identifier,
                );

              const credential =
                credentialRepository
                  .create({
                    accountId:
                      savedAccount.id,

                    passwordHash,

                    passwordChangedAt:
                      new Date(),
                  });

              await credentialRepository
                .save(
                  credential,
                );

              return savedAccount;
            },
          );

      return AccountResponseDto
        .fromEntity(
          account,
        );
    } catch (
      error: unknown
    ) {
      if (
        error instanceof
        ConflictException
      ) {
        throw this
          .createIdentifierConflictException();
      }

      if (
        this.isUniqueViolation(
          error,
        )
      ) {
        throw this
          .createIdentifierConflictException();
      }

      throw error;
    }
  }

  async login(
    input:
      LoginRequestDto,

    sessionOptions:
      LoginSessionOptions = {},
  ): Promise<AuthenticatedSession> {
    const identifier =
      await this.authIdentifierService
        .findEmailIdentifier(
          input.email,
        );

    if (!identifier) {
      throw this
        .createInvalidCredentialsException();
    }

    const account =
      await this.accountRepository
        .findOne({
          where: {
            id:
              identifier.accountId,
          },
        });

    if (
      !account ||
      account.status ===
        AccountStatus.Disabled
    ) {
      throw this
        .createInvalidCredentialsException();
    }

    const passwordIsValid =
      await this
        .passwordCredentialService
        .verifyPassword(
          account.id,
          input.password,
        );

    if (!passwordIsValid) {
      throw this
        .createInvalidCredentialsException();
    }
const csrfToken =
  this.tokenCryptoService
    .generateCsrfToken();

const csrfTokenHash =
  this.tokenCryptoService
    .fingerprint(
      csrfToken,
    );

const session =
  await this.authSessionService
    .createSession(
      account.id,
      {
        ...sessionOptions,

        csrfTokenHash,
      },
    );
   
    const tokenPair =
      await this.tokenCryptoService
        .generateTokenPair(
          account.id,
          session.id,
          session.accessVersion,
        );

    await this.refreshTokenService
      .createRefreshToken(
        session.id,
        tokenPair.refreshToken,
        tokenPair
          .refreshTokenExpiresAt,
      );

    return {
  accountId:
    account.id,

  sessionId:
    session.id,

  tokenId:
    tokenPair.tokenId,

  accessToken:
    tokenPair.accessToken,

  refreshToken:
    tokenPair.refreshToken,

  csrfToken,

  refreshExpiresAt:
    tokenPair
      .refreshTokenExpiresAt,
};
  }

  async refresh(
    input:
      RefreshRequestDto,
  ): Promise<RefreshResponseDto> {
    const currentTokenHash =
      this.tokenCryptoService
        .hashRefreshToken(
          input.refreshToken,
        );

    const result =
      await this.dataSource
        .transaction(
          async (
            transactionalManager,
          ): Promise<RotationResult> => {
            const refreshTokenRepository =
              transactionalManager
                .getRepository(
                  AuthRefreshTokenEntity,
                );

            const sessionRepository =
              transactionalManager
                .getRepository(
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

            if (!currentToken) {
              return {
                status: 'invalid',
              };
            }

            if (
              currentToken.usedAt ||
              currentToken
                .replacedByTokenId
            ) {
              await this
                .revokeSessionFamily(
                  currentToken
                    .sessionId,

                  refreshTokenRepository,

                  sessionRepository,
                );

              return {
                status:
                  'reuse-detected',
              };
            }

            if (
              currentToken.revokedAt ||
              currentToken.expiresAt
                .getTime() <=
                Date.now()
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
                      currentToken
                        .sessionId,
                  },
                )
                .getOne();

            if (
              !session ||
              session.revokedAt ||
              session.expiresAt
                .getTime() <=
                Date.now()
            ) {
              return {
                status:
                  'invalid',
              };
            }

            const tokenPair =
              await this
                .tokenCryptoService
                .generateTokenPair(
                  session.accountId,
                  session.id,
                  session.accessVersion,
                );

            const replacementToken =
              refreshTokenRepository
                .create({
                  sessionId:
                    session.id,

                  tokenHash:
                    tokenPair
                      .refreshTokenHash,

                  expiresAt:
                    tokenPair
                      .refreshTokenExpiresAt,

                  usedAt:
                    null,

                  revokedAt:
                    null,

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

            currentToken
              .replacedByTokenId =
              savedReplacementToken.id;

            await refreshTokenRepository
              .save(
                currentToken,
              );

            session.lastSeenAt =
              new Date();

            await sessionRepository
              .save(
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

            response
              .refreshTokenExpiresAt =
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
        .createInvalidRefreshTokenException();
    }

    return result.response;
  }

  async logout(
    input:
      LogoutRequestDto,
  ): Promise<LogoutResponseDto> {
    const tokenHash =
      this.tokenCryptoService
        .hashRefreshToken(
          input.refreshToken,
        );

    await this.dataSource
      .transaction(
        async (
          transactionalManager,
        ): Promise<void> => {
          const refreshTokenRepository =
            transactionalManager
              .getRepository(
                AuthRefreshTokenEntity,
              );

          const sessionRepository =
            transactionalManager
              .getRepository(
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
           * La déconnexion est
           * volontairement idempotente.
           */
          if (!refreshToken) {
            return;
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
                    refreshToken
                      .sessionId,
                },
              )
              .getOne();

          const now =
            new Date();

          await refreshTokenRepository
            .createQueryBuilder()
            .update(
              AuthRefreshTokenEntity,
            )
            .set({
              revokedAt:
                now,
            })
            .where(
              'session_id = :sessionId',
              {
                sessionId:
                  refreshToken
                    .sessionId,
              },
            )
            .andWhere(
              'revoked_at IS NULL',
            )
            .execute();

          if (
            session &&
            !session.revokedAt
          ) {
            session.revokedAt =
              now;

            await sessionRepository
              .save(
                session,
              );
          }
        },
      );

    const response =
      new LogoutResponseDto();

    response.loggedOut =
      true;

    return response;
  }

  private async revokeSessionFamily(
    sessionId: string,

    refreshTokenRepository:
      Repository<AuthRefreshTokenEntity>,

    sessionRepository:
      Repository<AuthSessionEntity>,
  ): Promise<void> {
    const now =
      new Date();

    await refreshTokenRepository
      .createQueryBuilder()
      .update(
        AuthRefreshTokenEntity,
      )
      .set({
        revokedAt:
          now,
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
      session.revokedAt =
        now;

      await sessionRepository
        .save(
          session,
        );
    }
  }

  private createIdentifierConflictException():
    ApiException<null> {
    return new ApiException({
      statusCode:
        HttpStatus.CONFLICT,

      code:
        ApiCodeResponse
          .AuthRegistrationIdentifierUnavailable,

      data:
        null,

      logMessage:
        'Registration identifier is unavailable',
    });
  }

  private createInvalidCredentialsException():
    ApiException<null> {
    return new ApiException({
      statusCode:
        HttpStatus.UNAUTHORIZED,

      code:
        ApiCodeResponse
          .AuthLoginInvalidCredentials,

      data:
        null,

      logMessage:
        'Authentication failed because the credentials are invalid',
    });
  }

  private createInvalidRefreshTokenException():
    ApiException<null> {
    return new ApiException({
      statusCode:
        HttpStatus.UNAUTHORIZED,

      code:
        ApiCodeResponse
          .AuthRefreshTokenInvalid,

      data:
        null,

      logMessage:
        'Refresh token validation failed',
    });
  }

  private createReuseDetectedException():
    ApiException<null> {
    return new ApiException({
      statusCode:
        HttpStatus.UNAUTHORIZED,

      code:
        ApiCodeResponse
          .AuthRefreshTokenReuseDetected,

      data:
        null,

      logMessage:
        'Refresh token reuse was detected and the session was revoked',
    });
  }

  private isUniqueViolation(
    error: unknown,
  ): boolean {
    if (
      !(
        error instanceof
        QueryFailedError
      )
    ) {
      return false;
    }

    const driverError =
      error.driverError as {
        code?: string;
      };

    return (
      driverError.code ===
      '23505'
    );
  }
}