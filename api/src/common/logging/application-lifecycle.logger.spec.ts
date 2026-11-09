import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  AppLoggerService,
} from './app-logger.service.js';

import {
  ApplicationLifecycleLogger,
} from './application-lifecycle.logger.js';

type AppLoggerServiceMock = {
  log: ReturnType<
    typeof jest.fn
  >;

  warn: ReturnType<
    typeof jest.fn
  >;
};

describe(
  'ApplicationLifecycleLogger',
  (): void => {
    let lifecycleLogger:
      ApplicationLifecycleLogger;

    let logger:
      AppLoggerServiceMock;

    beforeEach(
      (): void => {
        logger = {
          log:
            jest.fn(),

          warn:
            jest.fn(),
        };

        lifecycleLogger =
          new ApplicationLifecycleLogger(
            logger as unknown as
              AppLoggerService,
          );
      },
    );

    describe(
      'onApplicationBootstrap',
      (): void => {
        it(
          'doit journaliser que l’application est initialisée et prête',
          (): void => {
            lifecycleLogger
              .onApplicationBootstrap();

            expect(
              logger.log,
            ).toHaveBeenCalledTimes(
              1,
            );

            expect(
              logger.log,
            ).toHaveBeenCalledWith(
              'Application initialisée et prête',
              ApplicationLifecycleLogger
                .name,
            );
          },
        );

        it(
          'ne doit pas produire un avertissement au démarrage',
          (): void => {
            lifecycleLogger
              .onApplicationBootstrap();

            expect(
              logger.warn,
            ).not.toHaveBeenCalled();
          },
        );
      },
    );

    describe(
      'onApplicationShutdown',
      (): void => {
        it(
          'doit journaliser le signal d’arrêt reçu',
          (): void => {
            lifecycleLogger
              .onApplicationShutdown(
                'SIGTERM',
              );

            expect(
              logger.warn,
            ).toHaveBeenCalledTimes(
              1,
            );

            expect(
              logger.warn,
            ).toHaveBeenCalledWith(
              {
                message:
                  'Arrêt de l’application demandé',

                signal:
                  'SIGTERM',
              },

              ApplicationLifecycleLogger
                .name,
            );
          },
        );

        it(
          'doit prendre en charge le signal SIGINT',
          (): void => {
            lifecycleLogger
              .onApplicationShutdown(
                'SIGINT',
              );

            expect(
              logger.warn,
            ).toHaveBeenCalledWith(
              {
                message:
                  'Arrêt de l’application demandé',

                signal:
                  'SIGINT',
              },

              ApplicationLifecycleLogger
                .name,
            );
          },
        );

        it(
          'doit utiliser unknown lorsque le signal est absent',
          (): void => {
            lifecycleLogger
              .onApplicationShutdown();

            expect(
              logger.warn,
            ).toHaveBeenCalledWith(
              {
                message:
                  'Arrêt de l’application demandé',

                signal:
                  'unknown',
              },

              ApplicationLifecycleLogger
                .name,
            );
          },
        );

        it(
          'ne doit pas utiliser le niveau log pendant l’arrêt',
          (): void => {
            lifecycleLogger
              .onApplicationShutdown(
                'SIGTERM',
              );

            expect(
              logger.log,
            ).not.toHaveBeenCalled();
          },
        );
      },
    );

    describe(
      'cycle de vie complet',
      (): void => {
        it(
          'doit journaliser le démarrage puis l’arrêt',
          (): void => {
            lifecycleLogger
              .onApplicationBootstrap();

            lifecycleLogger
              .onApplicationShutdown(
                'SIGTERM',
              );

            expect(
              logger.log,
            ).toHaveBeenCalledTimes(
              1,
            );

            expect(
              logger.warn,
            ).toHaveBeenCalledTimes(
              1,
            );

            expect(
              logger.log,
            ).toHaveBeenCalledWith(
              'Application initialisée et prête',
              ApplicationLifecycleLogger
                .name,
            );

            expect(
              logger.warn,
            ).toHaveBeenCalledWith(
              {
                message:
                  'Arrêt de l’application demandé',

                signal:
                  'SIGTERM',
              },

              ApplicationLifecycleLogger
                .name,
            );
          },
        );
      },
    );
  },
);