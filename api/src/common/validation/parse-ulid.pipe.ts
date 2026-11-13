import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { 
  ApiCodeResponse,
   ApiException 
  } from '../api/index.js';

const ULID_REGEX = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;

@Injectable()
export class ParseUlidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string' || !ULID_REGEX.test(value)) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ApiCodeResponse.CommonInvalidIdentifier,
        logMessage: `Invalid ULID for parameter "${metadata.data ?? 'unknown'}"`,
      });
    }
    return value;
  }
}
