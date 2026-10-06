import {
  Global,
  Module,
} from '@nestjs/common';

import {
  AppLoggerService,
} from './app-logger.service.js';

import {
  ApplicationLifecycleLogger,
} from './application-lifecycle.logger.js';

@Global()
@Module({
  providers: [
    AppLoggerService,
    ApplicationLifecycleLogger,
  ],
  exports: [
    AppLoggerService,
  ],
})
export class LoggingModule {}