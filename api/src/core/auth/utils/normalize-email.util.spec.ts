import {
  describe,
  expect,
  it,
} from '@jest/globals';

import {
  normalizeEmail,
} from './normalize-email.util.js';

describe(
  'normalizeEmail',
  (): void => {
    it(
      'doit convertir l’adresse en minuscules',
      (): void => {
        expect(
          normalizeEmail(
            'Omar.Exemple@Domaine.be',
          ),
        ).toBe(
          'omar.exemple@domaine.be',
        );
      },
    );

    it(
      'doit retirer les espaces extérieurs',
      (): void => {
        expect(
          normalizeEmail(
            '  omar@example.com  ',
          ),
        ).toBe(
          'omar@example.com',
        );
      },
    );

    it(
      'doit appliquer les deux normalisations ensemble',
      (): void => {
        expect(
          normalizeEmail(
            '  OMAR@EXAMPLE.COM  ',
          ),
        ).toBe(
          'omar@example.com',
        );
      },
    );

    it(
      'ne doit pas modifier une adresse déjà normalisée',
      (): void => {
        expect(
          normalizeEmail(
            'omar@example.com',
          ),
        ).toBe(
          'omar@example.com',
        );
      },
    );

    it(
      'doit retourner une chaîne vide pour une valeur composée uniquement d’espaces',
      (): void => {
        expect(
          normalizeEmail(
            '   ',
          ),
        ).toBe('');
      },
    );
  },
);
