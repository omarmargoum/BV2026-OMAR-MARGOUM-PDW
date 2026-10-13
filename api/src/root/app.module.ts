import { Module } from '@nestjs/common';

import {
  AppConfigModule,
} from '../common/config/index';
import {
  DatabaseModule,
} from '../common/database/index';


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
  ],
})
export class AppModule {}
