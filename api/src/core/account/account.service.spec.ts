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

import type {
  Repository,
} from 'typeorm';

import {
  ApiCodeResponse,
  ApiException,
} from '../../common/api/index.js';

import {
  AccountService,
} from './account.service.js';

import {
  AccountEntity,
  AccountResponseDto,
  AccountStatus,
} from './data/index.js';

type AccountRepositoryMock = {
  findOne:
    ReturnType<typeof jest.fn>;
};

describe(
  'AccountService',
  (): void => {
    let service:
      AccountService;

    let accountRepository:
      AccountRepositoryMock;

    beforeEach(
      async (): Promise<void> => {
        accountRepository = {
          findOne:
            jest.fn(),
        };

        const module:
          TestingModule =
          await Test
            .createTestingModule({
              providers: [
                AccountService,

                {
                  provide:
                    getRepositoryToken(
                      AccountEntity,
                    ),

                  useValue:
                    accountRepository,
                },
              ],
            })
            .compile();

        service =
          module.get<AccountService>(
            AccountService,
          );
      },
    );

    describe(
      'findById',
      (): void => {
        it(
          'doit rechercher le compte avec son identifiant',
          async (): Promise<void> => {
            const account =
              createAccountEntity();

            accountRepository
              .findOne
              .mockResolvedValue(
                account as never,
              );

            await service.findById(
              account.id,
            );

            expect(
              accountRepository.findOne,
            ).toHaveBeenCalledTimes(
              1,
            );

            expect(
              accountRepository.findOne,
            ).toHaveBeenCalledWith({
              where: {
                id:
                  account.id,
              },
            });
          },
        );

        it(
          'doit retourner le DTO du compte trouvé',
          async (): Promise<void> => {
            const account =
              createAccountEntity();

            accountRepository
              .findOne
              .mockResolvedValue(
                account as never,
              );

            const result =
              await service.findById(
                account.id,
              );

            expect(result).toEqual(
              AccountResponseDto
                .fromEntity(
                  account,
                ),
            );
          },
        );

        it(
          'ne doit pas retourner directement l’entité de persistance',
          async (): Promise<void> => {
            const account =
              createAccountEntity();

            accountRepository
              .findOne
              .mockResolvedValue(
                account as never,
              );

            const result =
              await service.findById(
                account.id,
              );

            expect(result).not.toBe(
              account,
            );

            expect(result).toBeInstanceOf(
              AccountResponseDto,
            );
          },
        );

        it(
          'doit lever ApiException si le compte est introuvable',
          async (): Promise<void> => {
            accountRepository
              .findOne
              .mockResolvedValue(
                null as never,
              );

            await expect(
              service.findById(
                '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              ),
            ).rejects.toBeInstanceOf(
              ApiException,
            );
          },
        );

        it(
          'doit retourner le statut HTTP 404 si le compte est introuvable',
          async (): Promise<void> => {
            accountRepository
              .findOne
              .mockResolvedValue(
                null as never,
              );

            try {
              await service.findById(
                '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              );

              throw new Error(
                'La recherche aurait dû échouer.',
              );
            } catch (
              error: unknown
            ) {
              expect(error).toBeInstanceOf(
                ApiException,
              );

              const apiException =
                error as ApiException<null>;

              expect(
                apiException.getStatus(),
              ).toBe(
                HttpStatus.NOT_FOUND,
              );
            }
          },
        );

        it(
          'doit utiliser le code AccountNotFound',
          async (): Promise<void> => {
            accountRepository
              .findOne
              .mockResolvedValue(
                null as never,
              );

            try {
              await service.findById(
                '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              );

              throw new Error(
                'La recherche aurait dû échouer.',
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
                  .AccountNotFound,
              );

              expect(
                apiException.apiData,
              ).toBeNull();

              expect(
                apiException
                  .apiValidationErrors,
              ).toEqual([]);
            }
          },
        );

        it(
          'doit produire une enveloppe d’erreur publique sans détail technique',
          async (): Promise<void> => {
            accountRepository
              .findOne
              .mockResolvedValue(
                null as never,
              );

            try {
              await service.findById(
                '01ARZ3NDEKTSV4RRFFQ69G5FAV',
              );

              throw new Error(
                'La recherche aurait dû échouer.',
              );
            } catch (
              error: unknown
            ) {
              const apiException =
                error as ApiException<null>;

              expect(
                apiException.getResponse(),
              ).toEqual({
                code:
                  ApiCodeResponse
                    .AccountNotFound,

                result:
                  false,

                data:
                  null,

                validationErrors:
                  [],
              });
            }
          },
        );
      },
    );
  },
);

const createAccountEntity =
  (): AccountEntity => {
    const account =
      new AccountEntity();

    account.id =
      '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    account.status =
      AccountStatus.Pending;

    account.createdAt =
      new Date(
        '2026-01-15T10:00:00.000Z',
      );

    account.updatedAt =
      new Date(
        '2026-01-15T10:00:00.000Z',
      );

    account.version =
      1;

    return account;
  };