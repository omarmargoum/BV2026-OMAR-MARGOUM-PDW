import {
  HttpStatus,
} from '@nestjs/common';

import {
  ApiCodeResponse,
  ApiException,
} from '../../../../common/api/index.js';

export class PasswordPolicyException
  extends ApiException<null>
{
  constructor() {
    super({
      statusCode:
        HttpStatus.BAD_REQUEST,

      code:
        ApiCodeResponse
          .AuthPasswordPolicyInvalid,

      data:
        null,

      logMessage:
        'Password policy validation failed',
    });
  }
}