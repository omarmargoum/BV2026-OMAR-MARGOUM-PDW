import type {
  INestApplication,
} from '@nestjs/common';

import {
  Logger,
} from 'nestjs-pino';

import {
  ApiResponseInterceptor,
  HttpExceptionFilter,
} from '../../common/api/index.js';

export const configureApplication = (
  app: INestApplication,
): void => {
  const logger = app.get(Logger);

  const exceptionFilter =
    app.get(HttpExceptionFilter);

  const responseInterceptor =
    app.get(ApiResponseInterceptor);

  app.useLogger(logger);

  app.enableShutdownHooks();

  app.useGlobalFilters(
    exceptionFilter,
  );

  app.useGlobalInterceptors(
    responseInterceptor,
  );
};
