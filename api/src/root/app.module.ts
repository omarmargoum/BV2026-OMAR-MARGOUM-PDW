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
  ApiInterceptor,
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
    
    AccountModule,
  ],
  providers: [
    HttpExceptionFilter,
    ApiInterceptor,
  ],
})
export class AppModule {}
