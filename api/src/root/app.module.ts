import { Module } from '@nestjs/common';
import {
  ApiModule
} from '../common/api/index.js';

import {
  AppConfigModule,
} from '../common/config/index';
import {
  DatabaseModule,
} from '../common/database/index';
import {
  ApiResponseInterceptor,
  HttpExceptionFilter,

} from '../common/api/index.js';

import {
  LoggingModule,
} from '../common/logging/index';
import {
  HealthModule,
} from '../core/index';
@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    HealthModule,
    ApiModule,
  ],
  providers: [
    HttpExceptionFilter,
    ApiResponseInterceptor,
  ],
})
export class AppModule {}
