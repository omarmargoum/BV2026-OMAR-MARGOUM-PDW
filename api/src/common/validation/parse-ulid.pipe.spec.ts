import {
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';

import {
  HttpStatus,
} from '@nestjs/common';

import {
  ApiCodeResponse,
  ApiException,
} from '../api/index.js';

import {
  ParseUlidPipe,
} from './parse-ulid.pipe.js';

describe(
  'ParseUlidPipe',
  (): void => {
    let pipe:
      ParseUlidPipe;

    beforeEach(
      (): void => {
        pipe =
          new ParseUlidPipe();
      },
    );

    it(
      'doit retourner un ULID valide sans modification',
      (): void => {
        const validUlid =
          '01ARZ3NDEKTSV4RRFFQ69G5FAV';

        const result =
          pipe.transform(
            validUlid,
          );

        expect(result).toBe(
          validUlid,
        );
      },
    );

    it.each([
      '',
      'identifiant-invalide',
      '123',
      '01ARZ3NDEKTSV4RRFFQ69G5FA',
      '01ARZ3NDEKTSV4RRFFQ69G5FAVX',
      '01ARZ3NDEKTSV4RRFFQ69G5FAI',
      '01ARZ3NDEKTSV4RRFFQ69G5FAL',
      '01ARZ3NDEKTSV4RRFFQ69G5FAO',
      '01ARZ3NDEKTSV4RRFFQ69G5FAU',
    ])(
      'doit refuser la valeur invalide "%s"',
      (
        invalidValue: string,
      ): void => {
        expect(
          () =>
            pipe.transform(
              invalidValue,
            ),
        ).toThrow(
          ApiException,
        );
      },
    );

    it(
      'doit retourner le statut HTTP 400 pour un identifiant invalide',
      (): void => {
        try {
          pipe.transform(
            'identifiant-invalide',
          );

          throw new Error(
            'Le Pipe aurait dû refuser la valeur.',
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
            error as
              ApiException<null>;

          expect(
            apiException.getStatus(),
          ).toBe(
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );

    it(
      'doit utiliser le code CommonInvalidIdentifier',
      (): void => {
        try {
          pipe.transform(
            'identifiant-invalide',
          );

          throw new Error(
            'Le Pipe aurait dû refuser la valeur.',
          );
        } catch (
          error: unknown
        ) {
          const apiException =
            error as
              ApiException<null>;

          expect(
            apiException.apiCode,
          ).toBe(
            ApiCodeResponse
              .CommonInvalidIdentifier,
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
      'doit produire une enveloppe API publique sans détail technique',
      (): void => {
        try {
          pipe.transform(
            'identifiant-invalide',
          );

          throw new Error(
            'Le Pipe aurait dû refuser la valeur.',
          );
        } catch (
          error: unknown
        ) {
          const apiException =
            error as
              ApiException<null>;

          expect(
            apiException.getResponse(),
          ).toEqual({
            code:
              ApiCodeResponse
                .CommonInvalidIdentifier,

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