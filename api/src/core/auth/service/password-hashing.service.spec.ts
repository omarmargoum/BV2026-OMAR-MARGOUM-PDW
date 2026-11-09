import {
  PasswordHashingService,
} from './password-hashing.service.js';
import {
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';

describe(
  'PasswordHashingService',
  (): void => {
    let service:
      PasswordHashingService;

    beforeEach(
      (): void => {
        service =
          new PasswordHashingService();
      },
    );

    describe(
      'hashPassword',
      (): void => {
        it(
          'doit générer un hash Argon2id différent du mot de passe',
          async (): Promise<void> => {
            const plainPassword =
              'MotDePasseSolide123!';

            const passwordHash =
              await service.hashPassword(
                plainPassword,
              );

            expect(
              passwordHash,
            ).not.toBe(
              plainPassword,
            );

            expect(
              passwordHash,
            ).toMatch(
              /^\$argon2id\$/,
            );
          },
        );

        it(
          'doit produire deux hashes différents pour le même mot de passe',
          async (): Promise<void> => {
            const plainPassword =
              'MotDePasseSolide123!';

            const firstHash =
              await service.hashPassword(
                plainPassword,
              );

            const secondHash =
              await service.hashPassword(
                plainPassword,
              );

            expect(
              firstHash,
            ).not.toBe(
              secondHash,
            );
          },
        );
      },
    );

    describe(
      'verifyPassword',
      (): void => {
        it(
          'doit accepter le mot de passe correct',
          async (): Promise<void> => {
            const plainPassword =
              'MotDePasseSolide123!';

            const passwordHash =
              await service.hashPassword(
                plainPassword,
              );

            const isValid =
              await service.verifyPassword(
                passwordHash,
                plainPassword,
              );

            expect(
              isValid,
            ).toBe(true);
          },
        );

        it(
          'doit refuser un mauvais mot de passe',
          async (): Promise<void> => {
            const passwordHash =
              await service.hashPassword(
                'MotDePasseSolide123!',
              );

            const isValid =
              await service.verifyPassword(
                passwordHash,
                'MauvaisMotDePasse123!',
              );

            expect(
              isValid,
            ).toBe(false);
          },
        );

        it(
          'doit retourner false pour un hash invalide',
          async (): Promise<void> => {
            const isValid =
              await service.verifyPassword(
                'hash-invalide',
                'MotDePasseSolide123!',
              );

            expect(
              isValid,
            ).toBe(false);
          },
        );
      },
    );

    describe(
      'needsRehash',
      (): void => {
        it(
          'ne doit pas demander de rehash pour un hash récent',
          async (): Promise<void> => {
            const passwordHash =
              await service.hashPassword(
                'MotDePasseSolide123!',
              );

            expect(
              service.needsRehash(
                passwordHash,
              ),
            ).toBe(false);
          },
        );

        it(
          'doit demander un rehash pour une valeur invalide',
          (): void => {
            expect(
              service.needsRehash(
                'hash-invalide',
              ),
            ).toBe(true);
          },
        );
      },
    );
  },
);