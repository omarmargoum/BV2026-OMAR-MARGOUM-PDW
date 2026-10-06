import { Module } from '@nestjs/common';

import {
  AppConfigModule,
} from '../common/config/index';

import {
  LoggingModule,
} from '../common/logging/index.js';

@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
  ],
})
export class AppModule {}
