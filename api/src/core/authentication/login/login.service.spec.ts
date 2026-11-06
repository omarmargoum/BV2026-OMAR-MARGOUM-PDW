import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  HttpStatus,
} from '@nestjs/common';

import {
  Test,
  type TestingModule,
} from '@nestjs/testing';

import {
  getRepositoryToken,
} from '@nestjs/typeorm';

import {
  ApiCodeResponse,
  ApiException,
} from '../../../common/api/index.js';

import {
  AccountEntity,
  AccountStatus,
} from '../../../feature/account/data/index.js';

import {
  PasswordCredentialService,
} from '../credential/index.js';

import {
  AuthIdentifierEntity,
  LoginRequestDto,
} from '../data/index.js';

import {
  AuthIdentifierService,
} from '../identifier/index.js';

import {
  RefreshTokenService,
} from '../refresh-token/index.js';

import {
  SessionService,
} from '../session/index.js';

import {
  AuthTokenService,
} from '../token/index.js';

import {
  LoginService,
} from './login.service.js';

type AccountRepositoryMock = {
  findOne: ReturnType<
    typeof jest.fn
  >;
};

type AuthIdentifierServiceMock = {
  findEmailIdentifier:
    ReturnType<typeof jest.fn>;
};

type PasswordCredentialServiceMock = {
  verifyPassword:
    ReturnType<typeof jest.fn>;
};

type SessionServiceMock = {
  createSession:
    ReturnType<typeof jest.fn>;
};

type AuthTokenServiceMock = {
  generateTokenPair:
    ReturnType<typeof jest.fn>;
};

type RefreshTokenServiceMock = {
  createRefreshToken:
    ReturnType<typeof jest.fn>;
};

describe(
  'LoginService',
  (): void => {
    let service:
      LoginService;

    let accountRepository:
      AccountRepositoryMock;

    let authIdentifierService:
      AuthIdentifierServiceMock;

    let passwordCredentialService:
      PasswordCredentialServiceMock;

    let sessionService:
      SessionServiceMock;

    let authTokenService:
      AuthTokenServiceMock;

    let refreshTokenService:
      RefreshTokenServiceMock;

    const loginInput:
      LoginRequestDto = {
        email:
          'omar@example.com',

        password:
          'MotDePasseSolide123!',
      };

    const accountId =
      '01ACCOUNT00000000000000001';

    const identifierId =
      '01IDENTIFIER0000000000001';

    const sessionId =
      '01SESSION0000000000000001';

    const refreshTokenId =
      '01REFRESH0000000000000001';

    const createdAt =
      new Date(
        '2026-11-06T09:00:00.000Z',
      );

    const updatedAt =
      new Date(
        '2026-11-06T09:00:00.000Z',
      );

    const sessionExpiresAt =
      new Date(
        '2026-12-06T09:00:00.000Z',
      );

    const refreshTokenExpiresAt =
      new Date(
        '2026-12-06T09:00:00.000Z',
      );

    const createIdentifier =
      (): AuthIdentifierEntity => ({
        id:
          identifierId,

        accountId,

        value:
          'omar@example.com',

        normalizedValue:
          'omar@example.com',

        verifiedAt:
          null,
      }) as AuthIdentifierEntity;

    const createAccount =
      (
        status:
          AccountStatus =
          AccountStatus.Pending,
      ): AccountEntity => ({
        id:
          accountId,

        status,

        createdAt,

        updatedAt,

        version:
          1,
      }) as AccountEntity;

    beforeEach(
      async (): Promise<void> => {
        accountRepository = {
          findOne:
            jest.fn(),
        };

        authIdentifierService = {
          findEmailIdentifier:
            jest.fn(),
        };

        passwordCredentialService = {
          verifyPassword:
            jest.fn(),
        };

        sessionService = {
          createSession:
            jest.fn(),
        };

        authTokenService = {
          generateTokenPair:
            jest.fn(),
        };

        refreshTokenService = {
          createRefreshToken:
            jest.fn(),
        };

        const module:
          TestingModule =
          await Test
            .createTestingModule({
              providers: [
                LoginService,

                {
                  provide:
                    getRepositoryToken(
                      AccountEntity,
                    ),

                  useValue:
                    accountRepository,
                },

                {
                  provide:
                    AuthIdentifierService,

                  useValue:
                    authIdentifierService,
                },

                {
                  provide:
                    PasswordCredentialService,

                  useValue:
                    passwordCredentialService,
                },

                {
                  provide:
                    SessionService,

                  useValue:
                    sessionService,
                },

                {
                  provide:
                    AuthTokenService,

                  useValue:
                    authTokenService,
                },

                {
                  provide:
                    RefreshTokenService,

                  useValue:
                    refreshTokenService,
                },
              ],
            })
            .compile();

        service =
          module.get<LoginService>(
            LoginService,
          );
      },
    );

    const prepareSuccessfulLogin =
      (): void => {
        const identifier =
          createIdentifier();

        const account =
          createAccount();

        const session = {
          id:
            sessionId,

          accountId,

          expiresAt:
            sessionExpiresAt,

          revokedAt:
            null,

          lastSeenAt:
            createdAt,

          ipAddress:
            '127.0.0.1',

          userAgent:
            'Jest test client',
        };

        const tokenPair = {
          accessToken:
            'access-token-test',

          accessTokenExpiresInSeconds:
            900,

          refreshToken:
            'refresh-token-test',

          refreshTokenHash:
            'refresh-token-hash-test',

          refreshTokenExpiresAt,
        };

        const savedRefreshToken = {
          id:
            refreshTokenId,

          sessionId,

          tokenHash:
            tokenPair
              .refreshTokenHash,

          expiresAt:
            refreshTokenExpiresAt,

          usedAt:
            null,

          revokedAt:
            null,

          replacedByTokenId:
            null,
        };

        authIdentifierService
          .findEmailIdentifier
          .mockResolvedValue(
            identifier as never,
          );

        accountRepository
          .findOne
          .mockResolvedValue(
            account as never,
          );

        passwordCredentialService
          .verifyPassword
          .mockResolvedValue(
            true as never,
          );

        sessionService
          .createSession
          .mockResolvedValue(
            session as never,
          );

        authTokenService
          .generateTokenPair
          .mockResolvedValue(
            tokenPair as never,
          );

        refreshTokenService
          .createRefreshToken
          .mockResolvedValue(
            savedRefreshToken as never,
          );
      };

    describe(
      'login',
      (): void => {
        it(
          'doit refuser une adresse inconnue',
          async (): Promise<void> => {
            authIdentifierService
              .findEmailIdentifier
              .mockResolvedValue(
                null as never,
              );

            await expect(
              service.login(
                loginInput,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              accountRepository
                .findOne,
            ).not.toHaveBeenCalled();

            expect(
              passwordCredentialService
                .verifyPassword,
            ).not.toHaveBeenCalled();

            expect(
              sessionService
                .createSession,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit retourner une erreur 401 pour une adresse inconnue',
          async (): Promise<void> => {
            authIdentifierService
              .findEmailIdentifier
              .mockResolvedValue(
                null as never,
              );

            try {
              await service.login(
                loginInput,
              );

              throw new Error(
                'Le login aurait dû échouer.',
              );
            } catch (
              error: unknown
            ) {
              expect(
                error,
              ).toBeInstanceOf(
                ApiException,
              );

              const apiException =
                error as ApiException<null>;

              expect(
                apiException.getStatus(),
              ).toBe(
                HttpStatus.UNAUTHORIZED,
              );
            }
          },
        );

        it(
          'doit refuser un compte introuvable',
          async (): Promise<void> => {
            authIdentifierService
              .findEmailIdentifier
              .mockResolvedValue(
                createIdentifier() as never,
              );

            accountRepository
              .findOne
              .mockResolvedValue(
                null as never,
              );

            await expect(
              service.login(
                loginInput,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              passwordCredentialService
                .verifyPassword,
            ).not.toHaveBeenCalled();

            expect(
              sessionService
                .createSession,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit refuser un compte désactivé',
          async (): Promise<void> => {
            authIdentifierService
              .findEmailIdentifier
              .mockResolvedValue(
                createIdentifier() as never,
              );

            accountRepository
              .findOne
              .mockResolvedValue(
                createAccount(
                  AccountStatus.Disabled,
                ) as never,
              );

            await expect(
              service.login(
                loginInput,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              passwordCredentialService
                .verifyPassword,
            ).not.toHaveBeenCalled();

            expect(
              sessionService
                .createSession,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit refuser un mot de passe incorrect',
          async (): Promise<void> => {
            authIdentifierService
              .findEmailIdentifier
              .mockResolvedValue(
                createIdentifier() as never,
              );

            accountRepository
              .findOne
              .mockResolvedValue(
                createAccount() as never,
              );

            passwordCredentialService
              .verifyPassword
              .mockResolvedValue(
                false as never,
              );

            await expect(
              service.login(
                loginInput,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              passwordCredentialService
                .verifyPassword,
            ).toHaveBeenCalledWith(
              accountId,
              loginInput.password,
            );

            expect(
              sessionService
                .createSession,
            ).not.toHaveBeenCalled();

            expect(
              authTokenService
                .generateTokenPair,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit utiliser le même code public pour les credentials invalides',
          async (): Promise<void> => {
            authIdentifierService
              .findEmailIdentifier
              .mockResolvedValue(
                null as never,
              );

            try {
              await service.login(
                loginInput,
              );

              throw new Error(
                'Le login aurait dû échouer.',
              );
            } catch (
              error: unknown
            ) {
              const apiException =
                error as ApiException<null>;

              expect(
                apiException.apiCode,
              ).toBe(
                ApiCodeResponse
                  .AuthLoginInvalidCredentials,
              );
            }
          },
        );

        it(
          'doit créer une session après une authentification réussie',
          async (): Promise<void> => {
            prepareSuccessfulLogin();

            const sessionOptions = {
              ipAddress:
                '127.0.0.1',

              userAgent:
                'Jest test client',
            };

            await service.login(
              loginInput,
              sessionOptions,
            );

            expect(
              sessionService
                .createSession,
            ).toHaveBeenCalledWith(
              accountId,
              sessionOptions,
            );
          },
        );

        it(
          'doit générer les jetons avec le compte et la session',
          async (): Promise<void> => {
            prepareSuccessfulLogin();

            await service.login(
              loginInput,
            );

            expect(
              authTokenService
                .generateTokenPair,
            ).toHaveBeenCalledWith(
              accountId,
              sessionId,
            );
          },
        );

        it(
          'doit enregistrer le refresh token',
          async (): Promise<void> => {
            prepareSuccessfulLogin();

            await service.login(
              loginInput,
            );

            expect(
              refreshTokenService
                .createRefreshToken,
            ).toHaveBeenCalledWith(
              sessionId,
              'refresh-token-test',
              refreshTokenExpiresAt,
            );
          },
        );

        it(
          'doit retourner la réponse complète du login',
          async (): Promise<void> => {
            prepareSuccessfulLogin();

            const result =
              await service.login(
                loginInput,
                {
                  ipAddress:
                    '127.0.0.1',

                  userAgent:
                    'Jest test client',
                },
              );

            expect(
              result.account.id,
            ).toBe(
              accountId,
            );

            expect(
              result.account.status,
            ).toBe(
              AccountStatus.Pending,
            );

            expect(
              result.sessionId,
            ).toBe(
              sessionId,
            );

            expect(
              result.sessionExpiresAt,
            ).toBe(
              sessionExpiresAt
                .toISOString(),
            );

            expect(
              result.accessToken,
            ).toBe(
              'access-token-test',
            );

            expect(
              result
                .accessTokenExpiresInSeconds,
            ).toBe(
              900,
            );

            expect(
              result.refreshToken,
            ).toBe(
              'refresh-token-test',
            );

            expect(
              result.refreshTokenExpiresAt,
            ).toBe(
              refreshTokenExpiresAt
                .toISOString(),
            );
          },
        );

        it(
          'doit rechercher le compte avec l’identifiant associé',
          async (): Promise<void> => {
            prepareSuccessfulLogin();

            await service.login(
              loginInput,
            );

            expect(
              authIdentifierService
                .findEmailIdentifier,
            ).toHaveBeenCalledWith(
              loginInput.email,
            );

            expect(
              accountRepository
                .findOne,
            ).toHaveBeenCalledWith({
              where: {
                id:
                  accountId,
              },
            });
          },
        );
      },
    );
  },
);