import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  ApiCodeResponse,
} from '../enum/index.js';

import {
  ApiValidationError,
} from './api-validation-error.js';

export class ApiResponse<TData> {
  @ApiProperty({
    example: ApiCodeResponse.CommonSuccess,
  })
  code!: string;

  @ApiProperty({
    example: true,
  })
  result!: boolean;

  @ApiProperty({
    nullable: true,
  })
  data!: TData | null;

  @ApiProperty({
    type: () => [ApiValidationError],
  })
  validationErrors!: ApiValidationError[];

  static success<TData>(
    data: TData,
    code: string = ApiCodeResponse.CommonSuccess,
  ): ApiResponse<TData> {
    const response =
      new ApiResponse<TData>();

    response.code = code;
    response.result = true;
    response.data = data;
    response.validationErrors = [];

    return response;
  }

  static error<TData = never>(
    code: string =
      ApiCodeResponse.CommonError,
    validationErrors:
      ApiValidationError[] = [],
  ): ApiResponse<TData> {
    const response =
      new ApiResponse<TData>();

    response.code = code;
    response.result = false;
    response.data = null;
    response.validationErrors =
      validationErrors;

    return response;
  }
}