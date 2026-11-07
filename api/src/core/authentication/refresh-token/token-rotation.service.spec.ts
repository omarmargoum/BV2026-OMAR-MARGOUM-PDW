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
} from '../data/index.js';

import {
  AuthTokenService,
} from '../token/index.js';

import {
  TokenRotationService,
} from './token-rotation.service.js';

type QueryBuilderMock = {
  addSelect: ReturnType<
    typeof jest.fn
  >;

  setLock: ReturnType<
    typeof jest.fn
  >;

  where: ReturnType<
    typeof jest.fn
  >;

  getOne: ReturnType<
    typeof jest.fn
  >;
};

type UpdateQueryBuilderMock = {
  update: ReturnType<
    typeof jest.fn
  >;

  set: ReturnType<
    typeof jest.fn
  >;

  where: ReturnType<
    typeof jest.fn
  >;

  andWhere: ReturnType<
    typeof jest.fn
  >;

  execute: ReturnType<
    typeof jest.fn
  >;
};

type RepositoryMock = {
  create: ReturnType<
    typeof jest.fn
  >;

  save: ReturnType<
    typeof jest.fn
  >;

  createQueryBuilder:
    ReturnType<typeof jest.fn>;
};

type EntityManagerMock = {
  getRepository:
    ReturnType<typeof jest.fn>;
};

type DataSourceMock = {
  transaction:
    ReturnType<typeof jest.fn>;
};

type AuthTokenServiceMock = {
  hashRefreshToken:
    ReturnType<typeof jest.fn>;

  generateTokenPair:
    ReturnType<typeof jest.fn>;
};

describe(
  'TokenRotationService',
  (): void => {
    let service:
      TokenRotationService;

    let dataSource:
      DataSourceMock;

    let authTokenService:
      AuthTokenServiceMock;

    let entityManager:
      EntityManagerMock;

    let refreshTokenRepository:
      RepositoryMock;

    let sessionRepository:
      RepositoryMock;

    let refreshTokenQueryBuilder:
      QueryBuilderMock;

    let sessionQueryBuilder:
      QueryBuilderMock;

    let updateQueryBuilder:
      UpdateQueryBuilderMock;

    const sessionId =
      '01SESSION0000000000000001';

    const accountId =
      '01ACCOUNT0000000000000001';

    const currentTokenId =
      '01REFRESH0000000000000001';

    const replacementTokenId =
      '01REFRESH0000000000000002';

    const input:
      RefreshRequestDto = {
        refreshToken:
          'refresh-token-brut',
      };

    const tokenHash =
      'refresh-token-hash';

    const expiresAt =
      new Date(
        '2099-12-31T23:59:59.000Z',
      );

    const createCurrentToken =
      (
        overrides:
          Partial<AuthRefreshTokenEntity> = {},
      ): AuthRefreshTokenEntity => ({
        id:
          currentTokenId,

        sessionId,

        tokenHash,

        expiresAt,

        usedAt:
          null,

        revokedAt:
          null,

        replacedByTokenId:
          null,

        ...overrides,
      }) as AuthRefreshTokenEntity;

    const createSession =
      (
        overrides:
          Partial<AuthSessionEntity> = {},
      ): AuthSessionEntity => ({
        id:
          sessionId,

        accountId,

        expiresAt,

        revokedAt:
          null,

        lastSeenAt:
          null,

        ipAddress:
          null,

        userAgent:
          null,

        ...overrides,
      }) as AuthSessionEntity;

    beforeEach(
      async (): Promise<void> => {
        refreshTokenQueryBuilder = {
          addSelect:
            jest.fn(),

          setLock:
            jest.fn(),

          where:
            jest.fn(),

          getOne:
            jest.fn(),
        };

        refreshTokenQueryBuilder
          .addSelect
          .mockReturnValue(
            refreshTokenQueryBuilder,
          );

        refreshTokenQueryBuilder
          .setLock
          .mockReturnValue(
            refreshTokenQueryBuilder,
          );

        refreshTokenQueryBuilder
          .where
          .mockReturnValue(
            refreshTokenQueryBuilder,
          );

        sessionQueryBuilder = {
          addSelect:
            jest.fn(),

          setLock:
            jest.fn(),

          where:
            jest.fn(),

          getOne:
            jest.fn(),
        };

        sessionQueryBuilder
          .addSelect
          .mockReturnValue(
            sessionQueryBuilder,
          );

        sessionQueryBuilder
          .setLock
          .mockReturnValue(
            sessionQueryBuilder,
          );

        sessionQueryBuilder
          .where
          .mockReturnValue(
            sessionQueryBuilder,
          );

        updateQueryBuilder = {
          update:
            jest.fn(),

          set:
            jest.fn(),

          where:
            jest.fn(),

          andWhere:
            jest.fn(),

          execute:
            jest.fn(),
        };

        updateQueryBuilder.update
          .mockReturnValue(
            updateQueryBuilder,
          );

        updateQueryBuilder.set
          .mockReturnValue(
            updateQueryBuilder,
          );

        updateQueryBuilder.where
          .mockReturnValue(
            updateQueryBuilder,
          );

        updateQueryBuilder.andWhere
          .mockReturnValue(
            updateQueryBuilder,
          );

        updateQueryBuilder.execute
          .mockImplementation(
            async () => ({
              affected: 1,
            }),
          );

        refreshTokenRepository = {
          create:
            jest.fn(),

          save:
            jest.fn(),

          createQueryBuilder:
            jest.fn(),
        };

        sessionRepository = {
          create:
            jest.fn(),

          save:
            jest.fn(),

          createQueryBuilder:
            jest.fn(),
        };

        refreshTokenRepository
          .createQueryBuilder
          .mockImplementation(
            (
              alias?: string,
            ) => {
              if (
                alias ===
                'refreshToken'
              ) {
                return refreshTokenQueryBuilder;
              }

              return updateQueryBuilder;
            },
          );

        sessionRepository
          .createQueryBuilder
          .mockImplementation(
            () =>
              sessionQueryBuilder,
          );

        entityManager = {
          getRepository:
            jest.fn(),
        };

        entityManager.getRepository
          .mockImplementation(
            (
              entity:
                unknown,
            ) => {
              if (
                entity ===
                AuthRefreshTokenEntity
              ) {
                return refreshTokenRepository;
              }

              if (
                entity ===
                AuthSessionEntity
              ) {
                return sessionRepository;
              }

              throw new Error(
                'Repository inattendu.',
              );
            },
          );

        dataSource = {
          transaction:
            jest.fn(),
        };

        dataSource.transaction
          .mockImplementation(
            async (
              callback:
                (
                  manager:
                    EntityManagerMock,
                ) =>
                  Promise<unknown>,
            ) =>
              callback(
                entityManager,
              ),
          );

        authTokenService = {
          hashRefreshToken:
            jest.fn(),

          generateTokenPair:
            jest.fn(),
        };

        authTokenService
          .hashRefreshToken
          .mockReturnValue(
            tokenHash,
          );

        const module:
          TestingModule =
          await Test
            .createTestingModule({
              providers: [
                TokenRotationService,

                {
                  provide:
                    DataSource,

                  useValue:
                    dataSource,
                },

                {
                  provide:
                    AuthTokenService,

                  useValue:
                    authTokenService,
                },
              ],
            })
            .compile();

        service =
          module.get<TokenRotationService>(
            TokenRotationService,
          );
      },
    );

    it(
      'doit refuser un refresh token inconnu',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              null,
          );

        await expect(
          service.rotate(
            input,
          ),
        ).rejects.toBeInstanceOf(
          ApiException,
        );

        expect(
          authTokenService
            .generateTokenPair,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'doit retourner une erreur 401 pour un token inconnu',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              null,
          );

        try {
          await service.rotate(
            input,
          );

          throw new Error(
            'La rotation aurait dû échouer.',
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
      'doit utiliser le code invalid pour un token inconnu',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              null,
          );

        try {
          await service.rotate(
            input,
          );

          throw new Error(
            'La rotation aurait dû échouer.',
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
              .AuthRefreshTokenInvalid,
          );
        }
      },
    );

    it(
      'doit refuser un token expiré',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createCurrentToken({
                expiresAt:
                  new Date(
                    '2020-01-01T00:00:00.000Z',
                  ),
              }),
          );

        await expect(
          service.rotate(
            input,
          ),
        ).rejects.toBeInstanceOf(
          ApiException,
        );

        expect(
          authTokenService
            .generateTokenPair,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'doit refuser un token révoqué',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createCurrentToken({
                revokedAt:
                  new Date(),
              }),
          );

        await expect(
          service.rotate(
            input,
          ),
        ).rejects.toBeInstanceOf(
          ApiException,
        );
      },
    );

    it(
      'doit détecter la réutilisation d’un token déjà utilisé',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createCurrentToken({
                usedAt:
                  new Date(),
              }),
          );

        sessionQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createSession(),
          );

        sessionRepository.save
          .mockImplementation(
            async (
              value:
                AuthSessionEntity,
            ) =>
              value,
          );

        await expect(
          service.rotate(
            input,
          ),
        ).rejects.toBeInstanceOf(
          ApiException,
        );

        expect(
          updateQueryBuilder
            .update,
        ).toHaveBeenCalledWith(
          AuthRefreshTokenEntity,
        );

        expect(
          sessionRepository.save,
        ).toHaveBeenCalled();
      },
    );

    it(
      'doit retourner le code reuse-detected',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createCurrentToken({
                usedAt:
                  new Date(),
              }),
          );

        sessionQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createSession(),
          );

        sessionRepository.save
          .mockImplementation(
            async (
              value:
                AuthSessionEntity,
            ) =>
              value,
          );

        try {
          await service.rotate(
            input,
          );

          throw new Error(
            'La réutilisation aurait dû être détectée.',
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
              .AuthRefreshTokenReuseDetected,
          );
        }
      },
    );

    it(
      'doit refuser une session introuvable',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createCurrentToken(),
          );

        sessionQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              null,
          );

        await expect(
          service.rotate(
            input,
          ),
        ).rejects.toBeInstanceOf(
          ApiException,
        );

        expect(
          authTokenService
            .generateTokenPair,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'doit refuser une session révoquée',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createCurrentToken(),
          );

        sessionQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              createSession({
                revokedAt:
                  new Date(),
              }),
          );

        await expect(
          service.rotate(
            input,
          ),
        ).rejects.toBeInstanceOf(
          ApiException,
        );
      },
    );

    it(
      'doit effectuer une rotation complète',
      async (): Promise<void> => {
        const currentToken =
          createCurrentToken();

        const session =
          createSession();

        const tokenPair = {
          accessToken:
            'nouvel-access-token',

          accessTokenExpiresInSeconds:
            900,

          refreshToken:
            'nouveau-refresh-token',

          refreshTokenHash:
            'nouveau-refresh-hash',

          refreshTokenExpiresAt:
            expiresAt,
        };

        const replacementToken = {
          id:
            replacementTokenId,

          sessionId,

          tokenHash:
            tokenPair
              .refreshTokenHash,

          expiresAt,

          usedAt:
            null,

          revokedAt:
            null,

          replacedByTokenId:
            null,
        } as AuthRefreshTokenEntity;

        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              currentToken,
          );

        sessionQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              session,
          );

        authTokenService
          .generateTokenPair
          .mockImplementation(
            async () =>
              tokenPair,
          );

        refreshTokenRepository
          .create
          .mockReturnValue(
            replacementToken,
          );

        refreshTokenRepository
          .save
          .mockImplementation(
            async (
              value:
                AuthRefreshTokenEntity,
            ) =>
              value,
          );

        sessionRepository
          .save
          .mockImplementation(
            async (
              value:
                AuthSessionEntity,
            ) =>
              value,
          );

        const result =
          await service.rotate(
            input,
          );

        expect(
          authTokenService
            .hashRefreshToken,
        ).toHaveBeenCalledWith(
          input.refreshToken,
        );

        expect(
          authTokenService
            .generateTokenPair,
        ).toHaveBeenCalledWith(
          accountId,
          sessionId,
        );

        expect(
          refreshTokenRepository
            .create,
        ).toHaveBeenCalledWith({
          sessionId,

          tokenHash:
            'nouveau-refresh-hash',

          expiresAt,

          usedAt:
            null,

          revokedAt:
            null,

          replacedByTokenId:
            null,
        });

        expect(
          currentToken.usedAt,
        ).toBeInstanceOf(
          Date,
        );

        expect(
          currentToken
            .replacedByTokenId,
        ).toBe(
          replacementTokenId,
        );

        expect(
          session.lastSeenAt,
        ).toBeInstanceOf(
          Date,
        );

        expect(
          result.accessToken,
        ).toBe(
          'nouvel-access-token',
        );

        expect(
          result.refreshToken,
        ).toBe(
          'nouveau-refresh-token',
        );

        expect(
          result
            .accessTokenExpiresInSeconds,
        ).toBe(
          900,
        );

        expect(
          result.refreshTokenExpiresAt,
        ).toBe(
          expiresAt.toISOString(),
        );
      },
    );

    it(
      'doit utiliser une transaction et des verrous pessimistes',
      async (): Promise<void> => {
        refreshTokenQueryBuilder
          .getOne
          .mockImplementation(
            async () =>
              null,
          );

        await expect(
          service.rotate(
            input,
          ),
        ).rejects.toBeInstanceOf(
          ApiException,
        );

        expect(
          dataSource.transaction,
        ).toHaveBeenCalled();

        expect(
          refreshTokenQueryBuilder
            .setLock,
        ).toHaveBeenCalledWith(
          'pessimistic_write',
        );
      },
    );
  },
);