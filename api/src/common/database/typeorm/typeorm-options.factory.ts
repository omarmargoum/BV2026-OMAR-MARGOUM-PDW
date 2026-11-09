import {
  Injectable,
} from '@nestjs/common';

import type {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory as NestTypeOrmOptionsFactory,
} from '@nestjs/typeorm';

import {
  AppMode,
  DatabaseType,
  EnvService,
} from '../../config/index.js';

@Injectable()
export class TypeOrmOptionsFactory
  implements NestTypeOrmOptionsFactory
{
  constructor(
    private readonly envService:
      EnvService,
  ) {}

  createTypeOrmOptions():
    TypeOrmModuleOptions {
    const synchronize =
      this.envService.appMode ===
        AppMode.Production
        ? false
        : this.envService
            .databaseSynchronize;

    return {
      type:
        DatabaseType.PostgreSql,

      host:
        this.envService
          .databaseHost,

      port:
        this.envService
          .databasePort,

      username:
        this.envService
          .databaseUsername,

      password:
        this.envService
          .databasePassword,

      database:
        this.envService
          .databaseName,

      synchronize,

      autoLoadEntities:
        true,
    };
  }
}