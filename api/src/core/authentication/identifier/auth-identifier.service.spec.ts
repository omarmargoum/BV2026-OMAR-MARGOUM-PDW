import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  getRepositoryToken,
} from '@nestjs/typeorm';

import {
  Test,
  type TestingModule,
} from '@nestjs/testing';

import {
  ConflictException,
} from '@nestjs/common';

import {
  AuthIdentifierEntity,
  AuthIdentifierType,
} from '../data/index.js';

import {
  AuthIdentifierService,
} from './auth-identifier.service.js';

type IdentifierRepositoryMock = {
  create: ReturnType<
    typeof jest.fn
  >;

  save: ReturnType<
    typeof jest.fn
  >;

  findOne: ReturnType<
    typeof jest.fn
  >;

  exists: ReturnType<
    typeof jest.fn
  >;
};

describe(
  'AuthIdentifierService',
  (): void => {
    let service:
      AuthIdentifierService;

    let repository:
      IdentifierRepositoryMock;

    beforeEach(
      async (): Promise<void> => {
        repository = {
          create: jest.fn(),
          save: jest.fn(),
          findOne: jest.fn(),
          exists: jest.fn(),
        };

        const module:
          TestingModule =
          await Test
            .createTestingModule({
              providers: [
                AuthIdentifierService,
                {
                  provide:
                    getRepositoryToken(
                      AuthIdentifierEntity,
                    ),
                  useValue:
                    repository,
                },
              ],
            })
            .compile();

        service =
          module.get<AuthIdentifierService>(
            AuthIdentifierService,
          );
      },
    );

    describe(
      'normalizeEmail',
      (): void => {
        it(
          'doit supprimer les espaces et convertir l’adresse en minuscules',
          (): void => {
            const result =
              service.normalizeEmail(
                '  Omar.Exemple@Domaine.be  ',
              );

            expect(result).toBe(
              'omar.exemple@domaine.be',
            );
          },
        );

        it(
          'ne doit pas modifier une adresse déjà normalisée',
          (): void => {
            const result =
              service.normalizeEmail(
                'omar@example.com',
              );

            expect(result).toBe(
              'omar@example.com',
            );
          },
        );
      },
    );

    describe(
      'createEmailIdentifier',
      (): void => {
        it(
          'doit créer et enregistrer un identifiant normalisé',
          async (): Promise<void> => {
            repository.exists
              .mockResolvedValue(
                false as never,
              );

            const createdEntity = {
              id: 'identifier-id',
              accountId: 'account-id',
              type:
                AuthIdentifierType.Email,
              value:
                'Omar@Test.be',
              normalizedValue:
                'omar@test.be',
              verifiedAt: null,
            } as AuthIdentifierEntity;

            repository.create
              .mockReturnValue(
                createdEntity as never,
              );

            repository.save
              .mockResolvedValue(
                createdEntity as never,
              );

            const result =
              await service
                .createEmailIdentifier(
                  'account-id',
                  '  Omar@Test.be  ',
                );

            expect(
              repository.exists,
            ).toHaveBeenCalledWith({
              where: {
                type:
                  AuthIdentifierType.Email,
                normalizedValue:
                  'omar@test.be',
              },
            });

            expect(
              repository.create,
            ).toHaveBeenCalledWith({
              accountId:
                'account-id',
              type:
                AuthIdentifierType.Email,
              value:
                'Omar@Test.be',
              normalizedValue:
                'omar@test.be',
              verifiedAt:
                null,
            });

            expect(
              repository.save,
            ).toHaveBeenCalledWith(
              createdEntity,
            );

            expect(result).toBe(
              createdEntity,
            );
          },
        );

        it(
          'doit refuser une adresse déjà utilisée',
          async (): Promise<void> => {
            repository.exists
              .mockResolvedValue(
                true as never,
              );

            await expect(
              service
                .createEmailIdentifier(
                  'account-id',
                  'omar@example.com',
                ),
            ).rejects.toBeInstanceOf(
              ConflictException,
            );

            expect(
              repository.create,
            ).not.toHaveBeenCalled();

            expect(
              repository.save,
            ).not.toHaveBeenCalled();
          },
        );
      },
    );

    describe(
      'findEmailIdentifier',
      (): void => {
        it(
          'doit rechercher l’adresse sous sa forme normalisée',
          async (): Promise<void> => {
            const identifier = {
              id: 'identifier-id',
              accountId: 'account-id',
              type:
                AuthIdentifierType.Email,
              value:
                'Omar@Example.com',
              normalizedValue:
                'omar@example.com',
              verifiedAt: null,
            } as AuthIdentifierEntity;

            repository.findOne
              .mockResolvedValue(
                identifier as never,
              );

            const result =
              await service
                .findEmailIdentifier(
                  '  OMAR@EXAMPLE.COM  ',
                );

            expect(
              repository.findOne,
            ).toHaveBeenCalledWith({
              where: {
                type:
                  AuthIdentifierType.Email,
                normalizedValue:
                  'omar@example.com',
              },
            });

            expect(result).toBe(
              identifier,
            );
          },
        );

        it(
          'doit retourner null si l’adresse est inconnue',
          async (): Promise<void> => {
            repository.findOne
              .mockResolvedValue(
                null as never,
              );

            const result =
              await service
                .findEmailIdentifier(
                  'inconnu@example.com',
                );

            expect(result).toBeNull();
          },
        );
      },
    );

    describe(
      'existsByEmail',
      (): void => {
        it(
          'doit retourner true lorsque l’adresse existe',
          async (): Promise<void> => {
            repository.exists
              .mockResolvedValue(
                true as never,
              );

            const result =
              await service
                .existsByEmail(
                  'OMAR@EXAMPLE.COM',
                );

            expect(result).toBe(
              true,
            );

            expect(
              repository.exists,
            ).toHaveBeenCalledWith({
              where: {
                type:
                  AuthIdentifierType.Email,
                normalizedValue:
                  'omar@example.com',
              },
            });
          },
        );

        it(
          'doit retourner false lorsque l’adresse est inconnue',
          async (): Promise<void> => {
            repository.exists
              .mockResolvedValue(
                false as never,
              );

            const result =
              await service
                .existsByEmail(
                  'inconnu@example.com',
                );

            expect(result).toBe(
              false,
            );
          },
        );
      },
    );

    describe(
      'markAsVerified',
      (): void => {
        it(
          'doit retourner false si l’identifiant est introuvable',
          async (): Promise<void> => {
            repository.findOne
              .mockResolvedValue(
                null as never,
              );

            const result =
              await service
                .markAsVerified(
                  'identifier-inconnu',
                );

            expect(result).toBe(
              false,
            );

            expect(
              repository.save,
            ).not.toHaveBeenCalled();
          },
        );

        it(
          'doit marquer un identifiant comme vérifié',
          async (): Promise<void> => {
            const identifier = {
              id: 'identifier-id',
              verifiedAt: null,
            } as AuthIdentifierEntity;

            repository.findOne
              .mockResolvedValue(
                identifier as never,
              );

            repository.save
              .mockResolvedValue(
                identifier as never,
              );

            const result =
              await service
                .markAsVerified(
                  'identifier-id',
                );

            expect(result).toBe(
              true,
            );

            expect(
              identifier.verifiedAt,
            ).toBeInstanceOf(
              Date,
            );

            expect(
              repository.save,
            ).toHaveBeenCalledWith(
              identifier,
            );
          },
        );

        it(
          'ne doit pas réenregistrer un identifiant déjà vérifié',
          async (): Promise<void> => {
            const verifiedAt =
              new Date(
                '2026-01-01T10:00:00.000Z',
              );

            const identifier = {
              id: 'identifier-id',
              verifiedAt,
            } as AuthIdentifierEntity;

            repository.findOne
              .mockResolvedValue(
                identifier as never,
              );

            const result =
              await service
                .markAsVerified(
                  'identifier-id',
                );

            expect(result).toBe(
              true,
            );

            expect(
              identifier.verifiedAt,
            ).toBe(
              verifiedAt,
            );

            expect(
              repository.save,
            ).not.toHaveBeenCalled();
          },
        );
      },
    );
  },
);