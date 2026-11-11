import { 
  Module 
} from '@nestjs/common';

import {
  AppConfigModule,
} from '../common/config/index.js';
import {
  DatabaseModule,
} from '../common/database/index.js';
import {
  ApiInterceptor,
  HttpExceptionFilter,

} from '../common/api/index.js';

import {
  LoggingModule,
} from '../common/logging/index.js';
import {
  AccountModule,
  AuthModule,
  HealthModule,
} from '../core/index.js';
@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    
    AccountModule,
  ],
  providers: [
    HttpExceptionFilter,
    ApiInterceptor,
  ],
})
export class AppModule {}
