import {
  Global,
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  TypeOrmOptionsFactory,
} from './typeorm/typeorm-options.factory.js';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass:
        TypeOrmOptionsFactory,
    }),
  ],

  providers: [
    TypeOrmOptionsFactory,
  ],

  exports: [
    TypeOrmModule,
  ],
})
export class DatabaseModule {}