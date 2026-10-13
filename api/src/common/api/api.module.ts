import {
  Global,
  Module,
} from '@nestjs/common';

import {
  APP_INTERCEPTOR,
} from '@nestjs/core';

import {
  ApiResponseInterceptor,
} from './interceptor/index.js';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
  ],
})
export class ApiModule {}