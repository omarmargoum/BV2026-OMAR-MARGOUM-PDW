import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiCodeResponse,
} from '../enum/api-code-response.enum.js';

import {
  ApiResponse,
} from '../model/api-response.js';

import type {
  ApiValidationError,
} from '../model/api-validation-error.js';

export type ApiExceptionOptions<
  TData = unknown,
> = {
  statusCode?: HttpStatus;

  code?: string;

  data?: TData | null;

  validationErrors?:
    ApiValidationError[];

  logMessage?: string;
};

export class ApiException<
  TData = unknown,
> extends HttpException {
  readonly apiCode:
    string;

  readonly apiData:
    TData | null;

  readonly apiValidationErrors:
    ApiValidationError[];

  readonly logMessage?:
    string;

  constructor(
    options:
      ApiExceptionOptions<TData> = {},
  ) {
    const statusCode =
      options.statusCode ??
      HttpStatus.BAD_REQUEST;

    const response =
      ApiResponse.error<TData>({
        code:
          options.code ??
          ApiCodeResponse.CommonError,

        data:
          options.data ??
          null,

        validationErrors:
          options.validationErrors ??
          [],
      });

    super(
      response,
      statusCode,
    );

    this.apiCode =
      response.code;

    this.apiData =
      response.data;

    this.apiValidationErrors =
      response.validationErrors;

    this.logMessage =
      options.logMessage;
  }
}