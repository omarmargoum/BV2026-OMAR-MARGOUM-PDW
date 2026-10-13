import {
  Global,
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  AppConfigModule,
  EnvService,
} from '../config/index.js';

import {
  createNestTypeOrmOptions,
} from './nest-typeorm-options.factory.js';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        AppConfigModule,
      ],

      inject: [
        EnvService,
      ],

      useFactory:
        createNestTypeOrmOptions,
    }),
  ],

  exports: [
    TypeOrmModule,
  ],
})
export class DatabaseModule {}