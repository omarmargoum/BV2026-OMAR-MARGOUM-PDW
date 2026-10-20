import {
  CallHandler,
  ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import type {
  Observable,
} from 'rxjs';

import {
  map,
} from 'rxjs/operators';

import {
  ApiResponse,
} from '../data/index.js';

@Injectable()
export class ApiResponseInterceptor<TData>
  implements NestInterceptor<
    TData,
    ApiResponse<TData>
  >
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<TData>> {
    return next.handle().pipe(
      map(
        (data: TData): ApiResponse<TData> =>
          ApiResponse.success(data),
      ),
    );
  }
}