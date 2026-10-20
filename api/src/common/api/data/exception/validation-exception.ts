import {
  HttpStatus,
  type HttpExceptionOptions,
} from '@nestjs/common';

import {
  ApiCodeResponse,
} from '../enum/index.js';

import type {
  ApiValidationError,
} from '../model/index.js';

import {
  ApiException,
} from './api-exception.js';

export class ValidationException
  extends ApiException
{
  readonly validationErrors:
    ApiValidationError[];

  constructor(
    validationErrors:
      ApiValidationError[],
    options?: HttpExceptionOptions,
  ) {
    super(
      HttpStatus.UNPROCESSABLE_ENTITY,
      ApiCodeResponse.ValidationError,
      options,
    );

    this.validationErrors =
      validationErrors;
  }
}