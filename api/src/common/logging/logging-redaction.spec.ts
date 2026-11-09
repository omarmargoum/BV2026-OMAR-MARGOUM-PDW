import {
  describe,
  expect,
  it,
} from '@jest/globals';

import {
  redactSensitiveData,
} from './logging-redaction.js';

describe(
  'redactSensitiveData',
  (): void => {
    it(
      'doit conserver une valeur primitive non sensible',
      (): void => {
        expect(
          redactSensitiveData(
            'valeur publique',
          ),
        ).toBe(
          'valeur publique',
        );

        expect(
          redactSensitiveData(
            42,
          ),
        ).toBe(42);

        expect(
          redactSensitiveData(
            true,
          ),
        ).toBe(true);

        expect(
          redactSensitiveData(
            null,
          ),
        ).toBeNull();

        expect(
          redactSensitiveData(
            undefined,
          ),
        ).toBeUndefined();
      },
    );

    it(
      'doit masquer les informations d’authentification',
      (): void => {
        const result =
          redactSensitiveData({
            authorization:
              'Bearer access-token',

            cookie:
              'access_token=secret',

            setCookie:
              'refresh_token=secret',

            accessToken:
              'access-token-secret',

            refreshToken:
              'refresh-token-secret',

            token:
              'token-generique',

            tokenHash:
              'empreinte-token',
          });

        expect(result).toEqual({
          authorization:
            '[REDACTED]',

          cookie:
            '[REDACTED]',

          setCookie:
            '[REDACTED]',

          accessToken:
            '[REDACTED]',

          refreshToken:
            '[REDACTED]',

          token:
            '[REDACTED]',

          tokenHash:
            '[REDACTED]',
        });
      },
    );

    it(
      'doit masquer les mots de passe',
      (): void => {
        const result =
          redactSensitiveData({
            password:
              'MotDePasseSolide123!',

            passwordHash:
              'hash-argon2id',

            passwordConfirmation:
              'MotDePasseSolide123!',

            databasePassword:
              'mot-de-passe-postgresql',
          });

        expect(result).toEqual({
          password:
            '[REDACTED]',

          passwordHash:
            '[REDACTED]',

          passwordConfirmation:
            '[REDACTED]',

          databasePassword:
            '[REDACTED]',
        });
      },
    );

    it(
      'doit masquer les secrets et clés privées',
      (): void => {
        const result =
          redactSensitiveData({
            secret:
              'secret-applicatif',

            clientSecret:
              'secret-client',

            apiKey:
              'cle-api',

            privateKey:
              'cle-privee',
          });

        expect(result).toEqual({
          secret:
            '[REDACTED]',

          clientSecret:
            '[REDACTED]',

          apiKey:
            '[REDACTED]',

          privateKey:
            '[REDACTED]',
        });
      },
    );

    it(
      'doit masquer les valeurs CSRF',
      (): void => {
        const result =
          redactSensitiveData({
            csrfToken:
              'csrf-token-secret',

            csrfTokenHash:
              'csrf-token-hash-secret',
          });

        expect(result).toEqual({
          csrfToken:
            '[REDACTED]',

          csrfTokenHash:
            '[REDACTED]',
        });
      },
    );

    it(
      'doit reconnaître les clés sans distinction de casse',
      (): void => {
        const result =
          redactSensitiveData({
            Authorization:
              'Bearer secret',

            PASSWORD:
              'secret',

            RefreshToken:
              'refresh-secret',

            ClientSecret:
              'client-secret',
          });

        expect(result).toEqual({
          Authorization:
            '[REDACTED]',

          PASSWORD:
            '[REDACTED]',

          RefreshToken:
            '[REDACTED]',

          ClientSecret:
            '[REDACTED]',
        });
      },
    );

    it(
      'doit reconnaître les clés contenant des tirets, espaces ou underscores',
      (): void => {
        const result =
          redactSensitiveData({
            'access-token':
              'access-secret',

            refresh_token:
              'refresh-secret',

            'password confirmation':
              'password-secret',

            'csrf-token-hash':
              'csrf-hash-secret',

            'api-key':
              'api-secret',

            database_password:
              'database-secret',
          });

        expect(result).toEqual({
          'access-token':
            '[REDACTED]',

          refresh_token:
            '[REDACTED]',

          'password confirmation':
            '[REDACTED]',

          'csrf-token-hash':
            '[REDACTED]',

          'api-key':
            '[REDACTED]',

          database_password:
            '[REDACTED]',
        });
      },
    );

    it(
      'doit traiter les objets imbriqués récursivement',
      (): void => {
        const result =
          redactSensitiveData({
            request: {
              headers: {
                authorization:
                  'Bearer secret',

                accept:
                  'application/json',
              },

              body: {
                email:
                  'omar@example.com',

                password:
                  'MotDePasseSolide123!',
              },
            },

            response: {
              statusCode:
                200,
            },
          });

        expect(result).toEqual({
          request: {
            headers: {
              authorization:
                '[REDACTED]',

              accept:
                'application/json',
            },

            body: {
              email:
                'omar@example.com',

              password:
                '[REDACTED]',
            },
          },

          response: {
            statusCode:
              200,
          },
        });
      },
    );

    it(
      'doit traiter les tableaux récursivement',
      (): void => {
        const result =
          redactSensitiveData([
            {
              email:
                'premier@example.com',

              password:
                'premier-secret',
            },

            {
              email:
                'deuxieme@example.com',

              accessToken:
                'access-secret',
            },

            'valeur publique',
          ]);

        expect(result).toEqual([
          {
            email:
              'premier@example.com',

            password:
              '[REDACTED]',
          },

          {
            email:
              'deuxieme@example.com',

            accessToken:
              '[REDACTED]',
          },

          'valeur publique',
        ]);
      },
    );

    it(
      'doit conserver les propriétés non sensibles',
      (): void => {
        const result =
          redactSensitiveData({
            requestId:
              'request-id-001',

            method:
              'POST',

            path:
              '/auth/login',

            statusCode:
              200,

            email:
              'omar@example.com',

            accountId:
              'account-id',
          });

        expect(result).toEqual({
          requestId:
            'request-id-001',

          method:
            'POST',

          path:
            '/auth/login',

          statusCode:
            200,

          email:
            'omar@example.com',

          accountId:
            'account-id',
        });
      },
    );

    it(
      'ne doit pas modifier l’objet d’origine',
      (): void => {
        const original = {
          email:
            'omar@example.com',

          password:
            'MotDePasseSolide123!',

          nested: {
            accessToken:
              'access-secret',
          },
        };

        const result =
          redactSensitiveData(
            original,
          );

        expect(
          original.password,
        ).toBe(
          'MotDePasseSolide123!',
        );

        expect(
          original.nested.accessToken,
        ).toBe(
          'access-secret',
        );

        expect(result).toEqual({
          email:
            'omar@example.com',

          password:
            '[REDACTED]',

          nested: {
            accessToken:
              '[REDACTED]',
          },
        });

        expect(result).not.toBe(
          original,
        );
      },
    );
  },
);