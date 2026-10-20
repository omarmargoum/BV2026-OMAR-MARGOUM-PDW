import {
  HttpException,
  HttpStatus,
  type HttpExceptionOptions,
} from '@nestjs/common';

import {
  ApiCodeResponse,
} from '../enum/index.js';

import {
  ApiResponse,
} from '../model/index.js';

export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    code: string = ApiCodeResponse.CommonError,
    options?: HttpExceptionOptions,
  ) {
    super(
      ApiResponse.error(code),
      status,
      options,
    );
  }
}