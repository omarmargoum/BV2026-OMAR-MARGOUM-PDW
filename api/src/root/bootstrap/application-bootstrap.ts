import {
  HttpStatus,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import type {
  ValidationError,
} from 'class-validator';

import {
  Logger,
} from 'nestjs-pino';

import {
  ApiInterceptor,
  HttpExceptionFilter,
  setupSwagger,
  ValidationException,
} from '../../common/api/index.js';

export const configureApplication = (
  app: INestApplication,
): void => {
  const logger = app.get(Logger);

  const exceptionFilter =
    app.get(HttpExceptionFilter);

  const responseInterceptor =
    app.get(ApiInterceptor);

  app.useLogger(logger);

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory:(
        errors
      ) => 
          ValidationException
          .fromClassValidatorErrors(
            errors, 
            HttpStatus
            .UNPROCESSABLE_ENTITY,
      ),
    }),
  );

  app.useGlobalFilters(
    exceptionFilter,
  );

  app.useGlobalInterceptors(
    responseInterceptor,
  );

  setupSwagger(app);
};
