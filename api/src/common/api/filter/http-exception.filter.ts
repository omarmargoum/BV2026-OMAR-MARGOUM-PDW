import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import type {
  Request,
  Response,
} from 'express';

import {
  PinoLogger,
} from 'nestjs-pino';

import {
  LogCategory,
} from '../../logging/index.js';

import {
  ApiCodeResponse,
} from '../data/enum/api-code-response.enum.js';

import {
  ApiException,
} from '../data/exception/api-exception.js';

import {
  ApiResponse,
} from '../data/model/api-response.js';

@Catch()
@Injectable()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  constructor(
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(
      HttpExceptionFilter.name,
    );
  }

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
    const context =
      host.switchToHttp();

    const response =
      context.getResponse<Response>();

    const request =
      context.getRequest<Request>();

    const statusCode =
      this.getStatusCode(exception);

    const body =
      this.toApiResponse(exception);

    this.logException(
      exception,
      request,
      statusCode,
      body.code,
    );

    response
      .status(statusCode)
      .json(body);
  }

  private getStatusCode(
    exception: unknown,
  ): HttpStatus {
    if (
      exception instanceof HttpException
    ) {
      return exception.getStatus();
    }

    return HttpStatus
      .INTERNAL_SERVER_ERROR;
  }

  private toApiResponse(
    exception: unknown,
  ): ApiResponse<unknown> {
    if (
      exception instanceof ApiException
    ) {
      const apiException:
        ApiException<unknown> =
          exception;

      return ApiResponse.error({
        code: apiException.apiCode,
        data: apiException.apiData,
        validationErrors:
          apiException
            .apiValidationErrors,
      });
    }

    if (
      exception instanceof HttpException
    ) {
      return ApiResponse.error({
        code:
          ApiCodeResponse.CommonError,
      });
    }

    return ApiResponse.error({
      code:
        ApiCodeResponse.CommonError,
    });
  }

  private logException(
    exception: unknown,
    request: Request,
    statusCode: HttpStatus,
    code: string,
  ): void {
    const requestId =
      typeof request.id === 'string'
        ? request.id
        : undefined;

    const exceptionName =
      exception instanceof Error
        ? exception.constructor.name
        : typeof exception;

    const logContext = {
      category: LogCategory.Error,
      requestId,
      code,
      statusCode,
      method: request.method,

      // `path` exclut la query string.
      // Cela évite qu’une valeur sensible non
      // masquée dans l’URL fuite dans les logs.
      path: request.path,

      exceptionName,
    };

    if (
      statusCode >=
      HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      this.logger.error(
        {
          ...logContext,
          event:
            'error.request.unhandled',

          err:
            exception instanceof Error
              ? exception
              : undefined,
        },
        'Unhandled HTTP exception',
      );

      return;
    }

    this.logger.warn(
      {
        ...logContext,
        event:
          'error.request.handled',
      },
      'Handled HTTP exception',
    );
  }
}