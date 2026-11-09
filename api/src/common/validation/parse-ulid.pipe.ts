import {
  HttpStatus,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';

import {
  ApiCodeResponse,
  ApiException,
} from '../api/index.js';

import {
  isValidUlid,
} from '../database/index.js';

@Injectable()
export class ParseUlidPipe
  implements PipeTransform<
    string,
    string
  >
{
  transform(
    value: string,
  ): string {
    if (
      !isValidUlid(
        value,
      )
    ) {
      throw new ApiException<null>({
        statusCode:
          HttpStatus.BAD_REQUEST,

        code:
          ApiCodeResponse
            .CommonInvalidIdentifier,

        data:
          null,

        logMessage:
          'Invalid ULID identifier',
      });
    }

    return value;
  }
}