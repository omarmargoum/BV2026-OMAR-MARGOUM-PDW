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
  getRepositoryToken,
} from '@nestjs/typeorm';

import {
  PasswordCredentialEntity,
} from '../data/index.js';

import {
  PasswordHasherService,
} from './password-hasher.service.js';

import {
  PasswordCredentialService,
} from './password-credential.service.js';

type QueryBuilderMock = {
  addSelect: ReturnType<
    typeof jest.fn
  >;

  where: ReturnType<
    typeof jest.fn
  >;

  getOne: ReturnType<
    typeof jest.fn
  >;
};

type CredentialRepositoryMock = {
  create: ReturnType<
    typeof jest.fn
  >;

  save: ReturnType<
    typeof jest.fn
  >;

  exists: ReturnType<
    typeof jest.fn
  >;

  createQueryBuilder: ReturnType<
    typeof jest.fn
  >;
};

type PasswordHasherServiceMock = {
  hashPassword: ReturnType<
    typeof jest.fn
  >;

  verifyPassword: ReturnType<
    typeof jest.fn
  >;

  needsRehash: ReturnType<
    typeof jest.fn
  >;
};

describe(
  'PasswordCredentialService',
  (): void => {
    let service:
      PasswordCredentialService;

    let repository:
      CredentialRepositoryMock;

    let hashingService:
      PasswordHasherServiceMock;

    let queryBuilder:
      QueryBuilderMock;

    beforeEach(
      async (): Promise<void> => {
        queryBuilder = {
          addSelect: jest.fn(),
          where: jest.fn(),
          getOne: jest.fn(),
        };

        queryBuilder.addSelect
          .mockReturnValue(
            queryBuilder as never,
          );

        queryBuilder.where
          .mockReturnValue(
            queryBuilder as never,
          );

        repository = {
          create: jest.fn(),
          save: jest.fn(),
          exists: jest.fn(),
          createQueryBuilder:
            jest.fn(),
        };

        repository.createQueryBuilder
          .mockReturnValue(
            queryBuilder as never,
          );

        hashingService = {
          hashPassword: jest.fn(),
          verifyPassword: jest.fn(),
          needsRehash: jest.fn(),
        };

        const module:
          TestingModule =
          await Test
            .createTestingModule({
              providers: [
                PasswordCredentialService,

                {
                  provide:
                    getRepositoryToken(
                      PasswordCredentialEntity,
                    ),
                  useValue:
                    repository,
                },

                {
                  provide:
                    PasswordHasherService,
                  useValue:
                    hashingService,
                },
              ],
            })
            .compile();

        service =
          module.get<PasswordCredentialService>(
            PasswordCredentialService,
          );
      },
    );

    describe(
      'createCredential',
      (): void => {
        it(
          'doit hacher puis enregistrer le mot de passe',
          async (): Promise<void> => {
            hashingService.hashPassword
              .mockResolvedValue(
                'hash-argon2id' as never,
              );

            const credential = {
              id: 'credential-id',
              accountId: 'account-id',
              passwordHash:
                'hash-argon2id',
              passwordChangedAt:
                new Date(),
            } as PasswordCredentialEntity;

            repository.create
              .mockReturnValue(
                credential as never,
              );

            repository.save
              .mockResolvedValue(
                credential as never,
              );

            const result =
              await service.createCredential(
                'account-id',
                'MotDePasseSolide123!',
              );

            expect(
              hashingService.hashPassword,
            ).toHaveBeenCalledWith(
              'MotDePasseSolide123!',
            );

            expect(
              repository.create,
            ).toHaveBeenCalledWith(
              expect.objectContaining({
                accountId:
                  'account-id',
                passwordHash:
                  'hash-argon2id',
                passwordChangedAt:
                  expect.any(Date),
              }),
            );

            expect(
              repository.save,
            ).toHaveBeenCalledWith(
              credential,
            );

            expect(result).toBe(
              credential,
            );
          },
        );
      },
    );

    describe(
      'verifyPassword',
      (): void => {
        it(
          'doit retourner false si le credential est absent',
          async (): Promise<void> => {
            queryBuilder.getOne
              .mockResolvedValue(
                null as never,
              );

            const result =
              await service.verifyPassword(
                'account-id',
                'MotDePasseSolide123!',
              );

            expect(result).toBe(false);

            expect(
              hashingService.verifyPassword,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit retourner false pour un mauvais mot de passe',
          async (): Promise<void> => {
            const credential = {
              id: 'credential-id',
              accountId: 'account-id',
              passwordHash:
                'hash-argon2id',
              passwordChangedAt:
                new Date(),
            } as PasswordCredentialEntity;

            queryBuilder.getOne
              .mockResolvedValue(
                credential as never,
              );

            hashingService.verifyPassword
              .mockResolvedValue(
                false as never,
              );

            const result =
              await service.verifyPassword(
                'account-id',
                'MauvaisMotDePasse!',
              );

            expect(result).toBe(false);

            expect(
              hashingService.verifyPassword,
            ).toHaveBeenCalledWith(
              'hash-argon2id',
              'MauvaisMotDePasse!',
            );

            expect(
              hashingService.needsRehash,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit accepter le mot de passe correct sans rehash',
          async (): Promise<void> => {
            const credential = {
              id: 'credential-id',
              accountId: 'account-id',
              passwordHash:
                'hash-argon2id',
              passwordChangedAt:
                new Date(),
            } as PasswordCredentialEntity;

            queryBuilder.getOne
              .mockResolvedValue(
                credential as never,
              );

            hashingService.verifyPassword
              .mockResolvedValue(
                true as never,
              );

            hashingService.needsRehash
              .mockReturnValue(
                false as never,
              );

            const result =
              await service.verifyPassword(
                'account-id',
                'MotDePasseSolide123!',
              );

            expect(result).toBe(true);

            expect(
              repository.save,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit recalculer le hash si nécessaire',
          async (): Promise<void> => {
            const credential = {
              id: 'credential-id',
              accountId: 'account-id',
              passwordHash:
                'ancien-hash',
              passwordChangedAt:
                new Date(),
            } as PasswordCredentialEntity;

            queryBuilder.getOne
              .mockResolvedValue(
                credential as never,
              );

            hashingService.verifyPassword
              .mockResolvedValue(
                true as never,
              );

            hashingService.needsRehash
              .mockReturnValue(
                true as never,
              );

            hashingService.hashPassword
              .mockResolvedValue(
                'nouveau-hash' as never,
              );

            repository.save
              .mockResolvedValue(
                credential as never,
              );

            const result =
              await service.verifyPassword(
                'account-id',
                'MotDePasseSolide123!',
              );

            expect(result).toBe(true);

            expect(
              credential.passwordHash,
            ).toBe('nouveau-hash');

            expect(
              credential.passwordChangedAt,
            ).toBeInstanceOf(Date);

            expect(
              repository.save,
            ).toHaveBeenCalledWith(
              credential,
            );
          },
        );
      },
    );

    describe(
      'changePassword',
      (): void => {
        it(
          'ne doit rien enregistrer si le credential est absent',
          async (): Promise<void> => {
            queryBuilder.getOne
              .mockResolvedValue(
                null as never,
              );

            await service.changePassword(
              'account-id',
              'NouveauMotDePasse123!',
            );

            expect(
              hashingService.hashPassword,
            ).not.toHaveBeenCalled();

            expect(
              repository.save,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit hacher et enregistrer le nouveau mot de passe',
          async (): Promise<void> => {
            const credential = {
              id: 'credential-id',
              accountId: 'account-id',
              passwordHash:
                'ancien-hash',
              passwordChangedAt: null,
            } as PasswordCredentialEntity;

            queryBuilder.getOne
              .mockResolvedValue(
                credential as never,
              );

            hashingService.hashPassword
              .mockResolvedValue(
                'nouveau-hash' as never,
              );

            repository.save
              .mockResolvedValue(
                credential as never,
              );

            await service.changePassword(
              'account-id',
              'NouveauMotDePasse123!',
            );

            expect(
              hashingService.hashPassword,
            ).toHaveBeenCalledWith(
              'NouveauMotDePasse123!',
            );

            expect(
              credential.passwordHash,
            ).toBe('nouveau-hash');

            expect(
              credential.passwordChangedAt,
            ).toBeInstanceOf(Date);

            expect(
              repository.save,
            ).toHaveBeenCalledWith(
              credential,
            );
          },
        );
      },
    );

    describe(
      'existsForAccount',
      (): void => {
        it(
          'doit retourner true si le credential existe',
          async (): Promise<void> => {
            repository.exists
              .mockResolvedValue(
                true as never,
              );

            const result =
              await service.existsForAccount(
                'account-id',
              );

            expect(result).toBe(true);

            expect(
              repository.exists,
            ).toHaveBeenCalledWith({
              where: {
                accountId:
                  'account-id',
              },
            });
          },
        );

        it(
          'doit retourner false si le credential est absent',
          async (): Promise<void> => {
            repository.exists
              .mockResolvedValue(
                false as never,
              );

            const result =
              await service.existsForAccount(
                'account-id',
              );

            expect(result).toBe(false);
          },
        );
      },
    );

    it(
      'doit charger explicitement passwordHash',
      async (): Promise<void> => {
        queryBuilder.getOne
          .mockResolvedValue(
            null as never,
          );

        await service.verifyPassword(
          'account-id',
          'MotDePasseSolide123!',
        );

        expect(
          repository.createQueryBuilder,
        ).toHaveBeenCalledWith(
          'credential',
        );

        expect(
          queryBuilder.addSelect,
        ).toHaveBeenCalledWith(
          'credential.passwordHash',
        );

        expect(
          queryBuilder.where,
        ).toHaveBeenCalledWith(
          'credential.accountId = :accountId',
          {
            accountId:
              'account-id',
          },
        );
      },
    );
  },
);


