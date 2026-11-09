import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  ConsoleLogger,
} from '@nestjs/common';

import {
  AppLoggerService,
} from './app-logger.service.js';

describe(
  'AppLoggerService',
  (): void => {
    let logger:
      AppLoggerService;

    beforeEach(
      (): void => {
        logger =
          new AppLoggerService();
      },
    );

    afterEach(
      (): void => {
        jest.restoreAllMocks();
      },
    );

    describe(
      'log',
      (): void => {
        it(
          'doit transmettre une chaîne sans modification',
          (): void => {
            const logSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'log',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.log(
              'Application démarrée',
              'Bootstrap',
            );

            expect(
              logSpy,
            ).toHaveBeenCalledWith(
              'Application démarrée',
              'Bootstrap',
            );
          },
        );

        it(
          'doit sérialiser un objet au format JSON',
          (): void => {
            const logSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'log',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.log(
              {
                event:
                  'application.started',

                port:
                  3000,
              },
              'Bootstrap',
            );

            expect(
              logSpy,
            ).toHaveBeenCalledWith(
              JSON.stringify({
                event:
                  'application.started',

                port:
                  3000,
              }),
              'Bootstrap',
            );
          },
        );

        it(
          'doit masquer les données sensibles',
          (): void => {
            const logSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'log',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.log(
              {
                email:
                  'omar@example.com',

                password:
                  'MotDePasseSolide123!',

                accessToken:
                  'access-token-secret',
              },
              'Authentication',
            );

            expect(
              logSpy,
            ).toHaveBeenCalledWith(
              JSON.stringify({
                email:
                  'omar@example.com',

                password:
                  '[REDACTED]',

                accessToken:
                  '[REDACTED]',
              }),
              'Authentication',
            );
          },
        );
      },
    );

    describe(
      'fatal',
      (): void => {
        it(
          'doit masquer les secrets avant de transmettre le message',
          (): void => {
            const fatalSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'fatal',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.fatal(
              {
                event:
                  'database.connection.failed',

                databasePassword:
                  'mot-de-passe-secret',
              },
              'Database',
            );

            expect(
              fatalSpy,
            ).toHaveBeenCalledWith(
              JSON.stringify({
                event:
                  'database.connection.failed',

                databasePassword:
                  '[REDACTED]',
              }),
              'Database',
            );
          },
        );
      },
    );

    describe(
      'error',
      (): void => {
        it(
          'doit transmettre le message masqué, la stack et le contexte',
          (): void => {
            const errorSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'error',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.error(
              {
                event:
                  'authentication.failed',

                refreshToken:
                  'refresh-token-secret',
              },
              'Error: authentication failed',
              'Authentication',
            );

            expect(
              errorSpy,
            ).toHaveBeenCalledWith(
              JSON.stringify({
                event:
                  'authentication.failed',

                refreshToken:
                  '[REDACTED]',
              }),
              'Error: authentication failed',
              'Authentication',
            );
          },
        );

        it(
          'doit accepter une stack et un contexte absents',
          (): void => {
            const errorSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'error',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.error(
              'Erreur applicative',
            );

            expect(
              errorSpy,
            ).toHaveBeenCalledWith(
              'Erreur applicative',
              undefined,
              undefined,
            );
          },
        );
      },
    );

    describe(
      'warn',
      (): void => {
        it(
          'doit transmettre un avertissement après redaction',
          (): void => {
            const warnSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'warn',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.warn(
              {
                event:
                  'request.rejected',

                authorization:
                  'Bearer secret',
              },
              'Security',
            );

            expect(
              warnSpy,
            ).toHaveBeenCalledWith(
              JSON.stringify({
                event:
                  'request.rejected',

                authorization:
                  '[REDACTED]',
              }),
              'Security',
            );
          },
        );
      },
    );

    describe(
      'debug',
      (): void => {
        it(
          'doit transmettre un message de debug après redaction',
          (): void => {
            const debugSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'debug',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.debug(
              {
                event:
                  'token.generated',

                tokenHash:
                  'empreinte-secrete',
              },
              'TokenService',
            );

            expect(
              debugSpy,
            ).toHaveBeenCalledWith(
              JSON.stringify({
                event:
                  'token.generated',

                tokenHash:
                  '[REDACTED]',
              }),
              'TokenService',
            );
          },
        );
      },
    );

    describe(
      'verbose',
      (): void => {
        it(
          'doit transmettre un message verbose après redaction',
          (): void => {
            const verboseSpy =
              jest
                .spyOn(
                  ConsoleLogger.prototype,
                  'verbose',
                )
                .mockImplementation(
                  () =>
                    undefined,
                );

            logger.verbose(
              {
                event:
                  'request.received',

                csrfToken:
                  'csrf-secret',
              },
              'Http',
            );

            expect(
              verboseSpy,
            ).toHaveBeenCalledWith(
              JSON.stringify({
                event:
                  'request.received',

                csrfToken:
                  '[REDACTED]',
              }),
              'Http',
            );
          },
        );
      },
    );

    describe(
      'formatage de secours',
      (): void => {
        it(
  'doit utiliser String lorsque JSON.stringify échoue',
  (): void => {
    const logSpy =
      jest
        .spyOn(
          ConsoleLogger.prototype,
          'log',
        )
        .mockImplementation(
          () =>
            undefined,
        );

    /*
     * JSON.stringify ne prend pas en charge
     * les valeurs BigInt.
     *
     * redactSensitiveData retourne cette
     * valeur primitive sans récursion.
     */
    logger.log(
      BigInt(42),
      'Test',
    );

    expect(
      logSpy,
    ).toHaveBeenCalledWith(
      '42',
      'Test',
    );
  },
);
      },
    );
  },
);