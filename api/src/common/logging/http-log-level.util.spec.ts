import {
  describe,
  expect,
  it,
} from '@jest/globals';

import {
  getHttpLogLevel,
} from './http-log-level.util.js';

describe(
  'getHttpLogLevel',
  (): void => {
    describe(
      'réponses normales',
      (): void => {
        it.each([
          100,
          199,
          200,
          201,
          204,
          299,
          300,
          301,
          399,
        ])(
          'doit retourner log pour le statut %i',
          (
            statusCode: number,
          ): void => {
            expect(
              getHttpLogLevel(
                statusCode,
              ),
            ).toBe(
              'log',
            );
          },
        );
      },
    );

    describe(
      'erreurs client',
      (): void => {
        it.each([
          400,
          401,
          403,
          404,
          409,
          422,
          429,
          499,
        ])(
          'doit retourner warn pour le statut %i',
          (
            statusCode: number,
          ): void => {
            expect(
              getHttpLogLevel(
                statusCode,
              ),
            ).toBe(
              'warn',
            );
          },
        );
      },
    );

    describe(
      'erreurs serveur',
      (): void => {
        it.each([
          500,
          501,
          502,
          503,
          599,
        ])(
          'doit retourner error pour le statut %i',
          (
            statusCode: number,
          ): void => {
            expect(
              getHttpLogLevel(
                statusCode,
              ),
            ).toBe(
              'error',
            );
          },
        );
      },
    );

    it(
      'doit respecter les limites exactes des niveaux',
      (): void => {
        expect(
          getHttpLogLevel(
            399,
          ),
        ).toBe(
          'log',
        );

        expect(
          getHttpLogLevel(
            400,
          ),
        ).toBe(
          'warn',
        );

        expect(
          getHttpLogLevel(
            499,
          ),
        ).toBe(
          'warn',
        );

        expect(
          getHttpLogLevel(
            500,
          ),
        ).toBe(
          'error',
        );
      },
    );
  },
);