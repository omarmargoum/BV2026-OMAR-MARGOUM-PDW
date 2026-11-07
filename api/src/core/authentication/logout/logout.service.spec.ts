import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  Test,
  type TestingModule,
} from '@nestjs/testing';

import {
  DataSource,
} from 'typeorm';

import {
  AuthRefreshTokenEntity,
  AuthSessionEntity,
} from '../data/index.js';

import {
  AuthTokenService,
} from '../token/index.js';

import {
  LogoutService,
} from './logout.service.js';

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

  andWhere: ReturnType<
    typeof jest.fn
  >;

  getOne: ReturnType<
    typeof jest.fn
  >;

  update: ReturnType<
    typeof jest.fn
  >;

  set: ReturnType<
    typeof jest.fn
  >;

  execute: ReturnType<
    typeof jest.fn
  >;
};

type RepositoryMock = {
  createQueryBuilder: ReturnType<
    typeof jest.fn
  >;

  save: ReturnType<
    typeof jest.fn
  >;
};

type TransactionManagerMock = {
  getRepository: ReturnType<
    typeof jest.fn
  >;
};

type DataSourceMock = {
  transaction: ReturnType<
    typeof jest.fn
  >;
};

type AuthTokenServiceMock = {
  hashRefreshToken: ReturnType<
    typeof jest.fn
  >;
};

const createQueryBuilderMock =
  (): QueryBuilderMock => {
    const queryBuilder =
      {} as QueryBuilderMock;

    queryBuilder.addSelect =
      jest.fn(
        () => queryBuilder,
      );

    queryBuilder.setLock =
      jest.fn(
        () => queryBuilder,
      );

    queryBuilder.where =
      jest.fn(
        () => queryBuilder,
      );

    queryBuilder.andWhere =
      jest.fn(
        () => queryBuilder,
      );

    queryBuilder.getOne =
      jest.fn();

    queryBuilder.update =
      jest.fn(
        () => queryBuilder,
      );

    queryBuilder.set =
      jest.fn(
        () => queryBuilder,
      );

    queryBuilder.execute =
      jest.fn();

    return queryBuilder;
  };

describe(
  'LogoutService',
  (): void => {
    let service:
      LogoutService;

    let dataSource:
      DataSourceMock;

    let authTokenService:
      AuthTokenServiceMock;

    let transactionalManager:
      TransactionManagerMock;

    let refreshTokenRepository:
      RepositoryMock;

    let sessionRepository:
      RepositoryMock;

    let refreshTokenFindBuilder:
      QueryBuilderMock;

    let refreshTokenUpdateBuilder:
      QueryBuilderMock;

    let sessionFindBuilder:
      QueryBuilderMock;

    beforeEach(
      async (): Promise<void> => {
        refreshTokenFindBuilder =
          createQueryBuilderMock();

        refreshTokenUpdateBuilder =
          createQueryBuilderMock();

        sessionFindBuilder =
          createQueryBuilderMock();

        refreshTokenRepository = {
          createQueryBuilder:
            jest.fn(),

          save:
            jest.fn(),
        };

        sessionRepository = {
          createQueryBuilder:
            jest.fn(),

          save:
            jest.fn(),
        };

        /*
         * Premier appel :
         * recherche du refresh token.
         *
         * Deuxième appel :
         * mise à jour de tous les tokens
         * appartenant à la session.
         */
        refreshTokenRepository
          .createQueryBuilder
          .mockReturnValueOnce(
            refreshTokenFindBuilder as never,
          )
          .mockReturnValueOnce(
            refreshTokenUpdateBuilder as never,
          );

        sessionRepository
          .createQueryBuilder
          .mockReturnValue(
            sessionFindBuilder as never,
          );

        transactionalManager = {
          getRepository:
            jest.fn(
              (
                entity:
                  typeof AuthRefreshTokenEntity |
                  typeof AuthSessionEntity,
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
                  'Repository inattendu',
                );
              },
            ),
        };

        dataSource = {
          transaction:
            jest.fn(
              async (
                callback: (
                  manager:
                    TransactionManagerMock,
                ) => Promise<void>,
              ): Promise<void> => {
                await callback(
                  transactionalManager,
                );
              },
            ),
        };

        authTokenService = {
          hashRefreshToken:
            jest.fn(
              () =>
                'empreinte-refresh-token',
            ),
        };

        const module:
          TestingModule =
          await Test
            .createTestingModule({
              providers: [
                LogoutService,

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
          module.get<LogoutService>(
            LogoutService,
          );
      },
    );

    it(
      'doit calculer l’empreinte du refresh token',
      async (): Promise<void> => {
        refreshTokenFindBuilder
          .getOne
          .mockResolvedValue(
            null as never,
          );

        await service.logout({
          refreshToken:
            'refresh-token-brut',
        });

        expect(
          authTokenService
            .hashRefreshToken,
        ).toHaveBeenCalledWith(
          'refresh-token-brut',
        );
      },
    );

    it(
      'doit exécuter la déconnexion dans une transaction',
      async (): Promise<void> => {
        refreshTokenFindBuilder
          .getOne
          .mockResolvedValue(
            null as never,
          );

        await service.logout({
          refreshToken:
            'refresh-token-brut',
        });

        expect(
          dataSource.transaction,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      'doit retourner loggedOut true lorsque le token est inconnu',
      async (): Promise<void> => {
        refreshTokenFindBuilder
          .getOne
          .mockResolvedValue(
            null as never,
          );

        const result =
          await service.logout({
            refreshToken:
              'token-inconnu',
          });

        expect(result).toEqual({
          loggedOut: true,
        });

        expect(
          sessionRepository
            .createQueryBuilder,
        ).not.toHaveBeenCalled();

        expect(
          refreshTokenUpdateBuilder
            .execute,
        ).not.toHaveBeenCalled();

        expect(
          sessionRepository.save,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'doit rechercher le refresh token avec un verrou',
      async (): Promise<void> => {
        refreshTokenFindBuilder
          .getOne
          .mockResolvedValue(
            null as never,
          );

        await service.logout({
          refreshToken:
            'refresh-token-brut',
        });

        expect(
          refreshTokenRepository
            .createQueryBuilder,
        ).toHaveBeenCalledWith(
          'refreshToken',
        );

        expect(
          refreshTokenFindBuilder
            .addSelect,
        ).toHaveBeenCalledWith(
          'refreshToken.tokenHash',
        );

        expect(
          refreshTokenFindBuilder
            .setLock,
        ).toHaveBeenCalledWith(
          'pessimistic_write',
        );

        expect(
          refreshTokenFindBuilder
            .where,
        ).toHaveBeenCalledWith(
          'refreshToken.tokenHash = :tokenHash',
          {
            tokenHash:
              'empreinte-refresh-token',
          },
        );
      },
    );

    it(
      'doit révoquer la session et tous ses refresh tokens',
      async (): Promise<void> => {
        const refreshToken = {
          id: 'refresh-token-id',
          sessionId:
            'session-id',
        } as AuthRefreshTokenEntity;

        const session = {
          id: 'session-id',
          accountId:
            'account-id',
          revokedAt: null,
        } as AuthSessionEntity;

        refreshTokenFindBuilder
          .getOne
          .mockResolvedValue(
            refreshToken as never,
          );

        sessionFindBuilder
          .getOne
          .mockResolvedValue(
            session as never,
          );

        refreshTokenUpdateBuilder
          .execute
          .mockResolvedValue(
            {
              affected: 2,
            } as never,
          );

        sessionRepository
          .save
          .mockImplementation(
            async (
              value:
                AuthSessionEntity,
            ) => value as never,
          );

        const beforeLogout =
          Date.now();

        const result =
          await service.logout({
            refreshToken:
              'refresh-token-brut',
          });

        const afterLogout =
          Date.now();

        expect(result).toEqual({
          loggedOut: true,
        });

        expect(
          sessionFindBuilder
            .setLock,
        ).toHaveBeenCalledWith(
          'pessimistic_write',
        );

        expect(
          sessionFindBuilder
            .where,
        ).toHaveBeenCalledWith(
          'session.id = :sessionId',
          {
            sessionId:
              'session-id',
          },
        );

        expect(
          refreshTokenUpdateBuilder
            .update,
        ).toHaveBeenCalledWith(
          AuthRefreshTokenEntity,
        );

        expect(
          refreshTokenUpdateBuilder
            .where,
        ).toHaveBeenCalledWith(
          'session_id = :sessionId',
          {
            sessionId:
              'session-id',
          },
        );

        expect(
          refreshTokenUpdateBuilder
            .andWhere,
        ).toHaveBeenCalledWith(
          'revoked_at IS NULL',
        );

        expect(
          refreshTokenUpdateBuilder
            .execute,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          session.revokedAt,
        ).toBeInstanceOf(Date);

        const revokedAt =
          session.revokedAt as Date;

        expect(
          revokedAt.getTime(),
        ).toBeGreaterThanOrEqual(
          beforeLogout,
        );

        expect(
          revokedAt.getTime(),
        ).toBeLessThanOrEqual(
          afterLogout,
        );

        expect(
          sessionRepository.save,
        ).toHaveBeenCalledWith(
          session,
        );
      },
    );

    it(
      'ne doit pas réenregistrer une session déjà révoquée',
      async (): Promise<void> => {
        const revokedAt =
          new Date(
            '2026-01-01T10:00:00.000Z',
          );

        const refreshToken = {
          id: 'refresh-token-id',
          sessionId:
            'session-id',
        } as AuthRefreshTokenEntity;

        const session = {
          id: 'session-id',
          accountId:
            'account-id',
          revokedAt,
        } as AuthSessionEntity;

        refreshTokenFindBuilder
          .getOne
          .mockResolvedValue(
            refreshToken as never,
          );

        sessionFindBuilder
          .getOne
          .mockResolvedValue(
            session as never,
          );

        refreshTokenUpdateBuilder
          .execute
          .mockResolvedValue(
            {
              affected: 0,
            } as never,
          );

        const result =
          await service.logout({
            refreshToken:
              'refresh-token-brut',
          });

        expect(result).toEqual({
          loggedOut: true,
        });

        expect(
          session.revokedAt,
        ).toBe(revokedAt);

        expect(
          sessionRepository.save,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'doit rester idempotent lorsque la session est introuvable',
      async (): Promise<void> => {
        const refreshToken = {
          id: 'refresh-token-id',
          sessionId:
            'session-inconnue',
        } as AuthRefreshTokenEntity;

        refreshTokenFindBuilder
          .getOne
          .mockResolvedValue(
            refreshToken as never,
          );

        sessionFindBuilder
          .getOne
          .mockResolvedValue(
            null as never,
          );

        refreshTokenUpdateBuilder
          .execute
          .mockResolvedValue(
            {
              affected: 1,
            } as never,
          );

        const result =
          await service.logout({
            refreshToken:
              'refresh-token-brut',
          });

        expect(result).toEqual({
          loggedOut: true,
        });

        expect(
          refreshTokenUpdateBuilder
            .execute,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          sessionRepository.save,
        ).not.toHaveBeenCalled();
      },
    );
  },
);