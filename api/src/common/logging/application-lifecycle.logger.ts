import {
  Injectable,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';

import {
  AppLoggerService,
} from './app-logger.service.js';

@Injectable()
export class ApplicationLifecycleLogger
  implements
    OnApplicationBootstrap,
    OnApplicationShutdown
{
  constructor(
    private readonly logger:
      AppLoggerService,
  ) {}

  onApplicationBootstrap(): void {
    this.logger.log(
      'Application initialisée et prête',
      ApplicationLifecycleLogger.name,
    );
  }

  onApplicationShutdown(
    signal?: string,
  ): void {
    this.logger.warn(
      {
        message:
          'Arrêt de l’application demandé',
        signal: signal ?? 'unknown',
      },
      ApplicationLifecycleLogger.name,
    );
  }
}