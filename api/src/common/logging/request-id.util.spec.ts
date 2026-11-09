import {
  describe,
  expect,
  it,
} from '@jest/globals';

import {
  createRequestId,
  REQUEST_ID_HEADER,
  resolveRequestId,
} from './request-id.util.js';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe(
  'request-id.util',
  (): void => {
    describe(
      'REQUEST_ID_HEADER',
      (): void => {
        it(
          'doit utiliser le header x-request-id',
          (): void => {
            expect(
              REQUEST_ID_HEADER,
            ).toBe(
              'x-request-id',
            );
          },
        );
      },
    );

    describe(
      'createRequestId',
      (): void => {
        it(
          'doit générer un UUID version 4',
          (): void => {
            const requestId =
              createRequestId();

            expect(
              requestId,
            ).toMatch(
              UUID_V4_PATTERN,
            );
          },
        );

        it(
          'doit générer une valeur différente à chaque appel',
          (): void => {
            const firstRequestId =
              createRequestId();

            const secondRequestId =
              createRequestId();

            expect(
              firstRequestId,
            ).not.toBe(
              secondRequestId,
            );
          },
        );
      },
    );

    describe(
      'resolveRequestId',
      (): void => {
        it(
          'doit conserver un identifiant fourni sous forme de chaîne',
          (): void => {
            const result =
              resolveRequestId(
                'request-id-client',
              );

            expect(result).toBe(
              'request-id-client',
            );
          },
        );

        it(
          'doit supprimer les espaces autour de l’identifiant',
          (): void => {
            const result =
              resolveRequestId(
                '  request-id-client  ',
              );

            expect(result).toBe(
              'request-id-client',
            );
          },
        );

        it(
          'doit utiliser la première valeur d’un tableau',
          (): void => {
            const result =
              resolveRequestId([
                '  premier-id  ',
                'deuxieme-id',
              ]);

            expect(result).toBe(
              'premier-id',
            );
          },
        );

        it(
          'doit générer un UUID si la valeur est absente',
          (): void => {
            const result =
              resolveRequestId(
                undefined,
              );

            expect(result).toMatch(
              UUID_V4_PATTERN,
            );
          },
        );

        it(
          'doit générer un UUID pour une chaîne vide',
          (): void => {
            const result =
              resolveRequestId(
                '',
              );

            expect(result).toMatch(
              UUID_V4_PATTERN,
            );
          },
        );

        it(
          'doit générer un UUID pour une chaîne contenant uniquement des espaces',
          (): void => {
            const result =
              resolveRequestId(
                '   ',
              );

            expect(result).toMatch(
              UUID_V4_PATTERN,
            );
          },
        );

        it(
          'doit générer un UUID pour un tableau vide',
          (): void => {
            const result =
              resolveRequestId(
                [],
              );

            expect(result).toMatch(
              UUID_V4_PATTERN,
            );
          },
        );

        it(
          'doit générer un UUID si la première valeur du tableau est vide',
          (): void => {
            const result =
              resolveRequestId([
                '   ',
                'deuxieme-id',
              ]);

            expect(result).toMatch(
              UUID_V4_PATTERN,
            );
          },
        );
      },
    );
  },
);