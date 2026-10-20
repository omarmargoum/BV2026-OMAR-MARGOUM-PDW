import {
  Global,
  Module,
} from '@nestjs/common';

import {
  LoggerModule,
} from 'nestjs-pino';

import {
  AppLoggerService,
} from './app-logger.service.js';

import {
  ApplicationLifecycleLogger,
} from './application-lifecycle.logger.js';

@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.LOG_LEVEL ??
          'debug',

        transport:
          process.env.NODE_ENV ===
          'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime:
                    'SYS:standard',
                },
              }
            : undefined,

        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'password',
            '*.password',
            'accessToken',
            'refreshToken',
          ],
          censor: '[REDACTED]',
        },
      },
    }),
  ],

  providers: [
    AppLoggerService,
    ApplicationLifecycleLogger,
  ],

  exports: [
    AppLoggerService,
  ],
})
export class LoggingModule {}