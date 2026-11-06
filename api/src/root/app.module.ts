import { 
  Module 
} from '@nestjs/common';

import {
  AccountModule,
} from '../feature/index.js';
import {
  AppConfigModule,
} from '../common/config/index.js';
import {
  DatabaseModule,
} from '../common/database/index.js';
import {
  ApiModule,
  ApiResponseInterceptor,
  HttpExceptionFilter,

} from '../common/api/index.js';

import {
  LoggingModule,
} from '../common/logging/index.js';
import {
  AuthenticationModule,
  HealthModule,
} from '../core/index.js';
@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    AuthenticationModule,
    HealthModule,
    ApiModule,
    AccountModule,
  ],
  providers: [
    HttpExceptionFilter,
    ApiResponseInterceptor,
  ],
})
export class AppModule {}
