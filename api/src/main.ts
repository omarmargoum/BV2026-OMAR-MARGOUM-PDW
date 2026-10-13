import {
  NestFactory,
} from '@nestjs/core';

import {
  EnvService,
} from './common/config/index.js';

import {
  AppLoggerService,
} from './common/logging/index.js';

import {
  AppModule,
} from './root/index.js';

const bootstrap =
  async (): Promise<void> => {
    const app =
      await NestFactory.create(
        AppModule,
        {
          bufferLogs: true,
        },
      );

    const logger =
      app.get(AppLoggerService);

    const envService =
      app.get(EnvService);

    const port: number =
      envService.port;

    app.useLogger(logger);
    app.enableShutdownHooks();
/* // Test temporaire de la configuration PostgreSQL
  logger.log(
    {
      databaseHost: envService.databaseHost,
      databasePort: envService.databasePort,
      databaseUsername: envService.databaseUsername,
      databaseName: envService.databaseName,
      databaseSynchronize:
        envService.databaseSynchronize,
    },
    'DatabaseConfiguration',
  ); */
    await app.listen(port);

    logger.log(
      `API disponible sur le port ${port}`,
      'Bootstrap',
    );
  };

void bootstrap();
