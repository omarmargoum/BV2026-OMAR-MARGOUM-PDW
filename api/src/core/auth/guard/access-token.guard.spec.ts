import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  type ExecutionContext,
  HttpStatus,
} from '@nestjs/common';

import {
  Reflector,
} from '@nestjs/core';

import {
  Test,
  type TestingModule,
} from '@nestjs/testing';

import type {
  Request,
} from 'express';

import {
  ApiCodeResponse,
  ApiException,
} from '../../../common/api/index.js';

import type {
  AuthContext,
} from '../data/index.js';

import {
  AuthSessionService,
} from '../service/auth-session.service.js';

import {
  TokenCryptoService,
  type AccessTokenPayload,
} from '../service/token-crypto.service.js';

import {
  AccessTokenGuard,
} from './access-token.guard.js';

type AuthenticatedRequest =
  Request & {
    auth?: AuthContext;
  };

type ReflectorMock = {
  getAllAndOverride:
    ReturnType<typeof jest.fn>;
};

type TokenCryptoServiceMock = {
  verifyAccessToken:
    ReturnType<typeof jest.fn>;
};

type AuthAuthSessionServiceMock = {
  findActiveSession:
    ReturnType<typeof jest.fn>;
};

describe(
  'AccessTokenGuard',
  (): void => {
    let guard:
      AccessTokenGuard;

    let reflector:
      ReflectorMock;

    let tokenCryptoService:
      TokenCryptoServiceMock;

    let authSessionService:
      AuthAuthSessionServiceMock;

    let request:
      AuthenticatedRequest;

    let executionContext:
      ExecutionContext;

    const accountId =
      '01ACCOUNT0000000000000001';

    const sessionId =
      '01SESSION0000000000000001';

    const accessToken =
      'access-token-test';

    const createExecutionContext =
      (
        currentRequest:
          AuthenticatedRequest,
      ): ExecutionContext => {
        const switchToHttp =
          jest.fn()
            .mockReturnValue({
              getRequest:
                jest.fn()
                  .mockReturnValue(
                    currentRequest,
                  ),
            });

        return {
          switchToHttp,

          getHandler:
            jest.fn()
              .mockReturnValue(
                (): void => {},
              ),

          getClass:
            jest.fn()
              .mockReturnValue(
                class TestController {},
              ),
        } as unknown as
          ExecutionContext;
      };

    const prepareValidAuthentication =
      (): void => {
        reflector
          .getAllAndOverride
          .mockReturnValue(
            false,
          );

        request.headers = {
          authorization:
            `Bearer ${accessToken}`,
        };

        tokenCryptoService
          .verifyAccessToken
          .mockImplementation(
            async (): Promise<
              AccessTokenPayload
            > => ({
              sub:
                accountId,

              sid:
                sessionId,
            }),
          );

        authSessionService
          .findActiveSession
          .mockImplementation(
            async () => ({
              id:
                sessionId,

              accountId,

              expiresAt:
                new Date(
                  '2099-12-31T23:59:59.000Z',
                ),

              revokedAt:
                null,

              lastSeenAt:
                new Date(),

              ipAddress:
                null,

              userAgent:
                null,
            }),
          );
      };

    beforeEach(
      async (): Promise<void> => {
        reflector = {
          getAllAndOverride:
            jest.fn(),
        };

        tokenCryptoService = {
          verifyAccessToken:
            jest.fn(),
        };

        authSessionService = {
          findActiveSession:
            jest.fn(),
        };

        request = {
          headers: {},
        } as AuthenticatedRequest;

        executionContext =
          createExecutionContext(
            request,
          );

        const module:
          TestingModule =
          await Test
            .createTestingModule({
              providers: [
                AccessTokenGuard,

                {
                  provide:
                    Reflector,

                  useValue:
                    reflector,
                },

                {
                  provide:
                    TokenCryptoService,

                  useValue:
                    tokenCryptoService,
                },

                {
                  provide:
                    AuthSessionService,

                  useValue:
                    authSessionService,
                },
              ],
            })
            .compile();

        guard =
          module.get<AccessTokenGuard>(
            AccessTokenGuard,
          );
      },
    );

    describe(
      'route publique',
      (): void => {
        it(
          'doit autoriser une route publique sans access token',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                true,
              );

            const result =
              await guard.canActivate(
                executionContext,
              );

            expect(result).toBe(
              true,
            );

            expect(
              tokenCryptoService
                .verifyAccessToken,
            ).not.toHaveBeenCalled();

            expect(
              authSessionService
                .findActiveSession,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit rechercher la métadonnée sur la méthode et la classe',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                true,
              );

            await guard.canActivate(
              executionContext,
            );

            expect(
              reflector
                .getAllAndOverride,
            ).toHaveBeenCalledWith(
              'authentication.is-public',
              [
                executionContext
                  .getHandler(),

                executionContext
                  .getClass(),
              ],
            );
          },
        );
      },
    );

    describe(
      'en-tête Authorization',
      (): void => {
        it(
          'doit refuser une requête sans Authorization',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              tokenCryptoService
                .verifyAccessToken,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit refuser un schéma autre que Bearer',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            request.headers = {
              authorization:
                `Basic ${accessToken}`,
            };

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              tokenCryptoService
                .verifyAccessToken,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit refuser un Bearer sans token',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            request.headers = {
              authorization:
                'Bearer',
            };

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );
          },
        );

        it(
          'doit accepter le mot Bearer sans distinction de casse',
          async (): Promise<void> => {
            prepareValidAuthentication();

            request.headers = {
              authorization:
                `bearer ${accessToken}`,
            };

            const result =
              await guard.canActivate(
                executionContext,
              );

            expect(result).toBe(
              true,
            );
          },
        );
      },
    );

    describe(
      'validation du JWT',
      (): void => {
        it(
          'doit refuser un access token invalide',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            request.headers = {
              authorization:
                `Bearer ${accessToken}`,
            };

            tokenCryptoService
              .verifyAccessToken
              .mockImplementation(
                async () => {
                  throw new Error(
                    'JWT invalide',
                  );
                },
              );

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              authSessionService
                .findActiveSession,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit refuser un payload sans sub',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            request.headers = {
              authorization:
                `Bearer ${accessToken}`,
            };

            tokenCryptoService
              .verifyAccessToken
              .mockImplementation(
                async () => ({
                  sub: '',
                  sid:
                    sessionId,
                }),
              );

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              authSessionService
                .findActiveSession,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit refuser un payload sans sid',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            request.headers = {
              authorization:
                `Bearer ${accessToken}`,
            };

            tokenCryptoService
              .verifyAccessToken
              .mockImplementation(
                async () => ({
                  sub:
                    accountId,

                  sid: '',
                }),
              );

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              authSessionService
                .findActiveSession,
            ).not.toHaveBeenCalled();
          },
        );
      },
    );

    describe(
      'validation de la session',
      (): void => {
        it(
          'doit refuser une session absente ou inactive',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            request.headers = {
              authorization:
                `Bearer ${accessToken}`,
            };

            tokenCryptoService
              .verifyAccessToken
              .mockImplementation(
                async () => ({
                  sub:
                    accountId,

                  sid:
                    sessionId,
                }),
              );

            authSessionService
              .findActiveSession
              .mockImplementation(
                async () =>
                  null,
              );

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );

            expect(
              authSessionService
                .findActiveSession,
            ).toHaveBeenCalledWith(
              sessionId,
            );
          },
        );

        it(
          'doit refuser une session associée à un autre compte',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            request.headers = {
              authorization:
                `Bearer ${accessToken}`,
            };

            tokenCryptoService
              .verifyAccessToken
              .mockImplementation(
                async () => ({
                  sub:
                    accountId,

                  sid:
                    sessionId,
                }),
              );

            authSessionService
              .findActiveSession
              .mockImplementation(
                async () => ({
                  id:
                    sessionId,

                  accountId:
                    'autre-compte',

                  expiresAt:
                    new Date(
                      '2099-12-31T23:59:59.000Z',
                    ),

                  revokedAt:
                    null,
                }),
              );

            await expect(
              guard.canActivate(
                executionContext,
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );
          },
        );
      },
    );

    describe(
      'authentification valide',
      (): void => {
        it(
          'doit vérifier le token et la session',
          async (): Promise<void> => {
            prepareValidAuthentication();

            const result =
              await guard.canActivate(
                executionContext,
              );

            expect(result).toBe(
              true,
            );

            expect(
              tokenCryptoService
                .verifyAccessToken,
            ).toHaveBeenCalledWith(
              accessToken,
            );

            expect(
              authSessionService
                .findActiveSession,
            ).toHaveBeenCalledWith(
              sessionId,
            );
          },
        );

        it(
          'doit ajouter AuthContext à la requête',
          async (): Promise<void> => {
            prepareValidAuthentication();

            await guard.canActivate(
              executionContext,
            );

            expect(
              request.auth,
            ).toEqual({
              accountId,
              sessionId,
            });
          },
        );
      },
    );

    describe(
      'réponse non autorisée',
      (): void => {
        it(
          'doit retourner le statut 401',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            try {
              await guard.canActivate(
                executionContext,
              );

              throw new Error(
                'Le Guard aurait dû refuser la requête.',
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
          'doit utiliser le code public unauthorized',
          async (): Promise<void> => {
            reflector
              .getAllAndOverride
              .mockReturnValue(
                false,
              );

            try {
              await guard.canActivate(
                executionContext,
              );

              throw new Error(
                'Le Guard aurait dû refuser la requête.',
              );
            } catch (
              error: unknown
            ) {
              const apiException =
                error as ApiException<null>;

              expect(
                apiException.getResponse(),
              ).toEqual(
                expect.objectContaining({
                  code:
                    ApiCodeResponse
                      .AuthAccessUnauthorized,
                }),
              );
            }
          },
        );
      },
    );
  },
);



