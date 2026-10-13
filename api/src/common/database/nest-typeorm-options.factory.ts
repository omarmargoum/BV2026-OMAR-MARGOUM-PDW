import type {
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import {
  EnvService,
} from '../config/index.js';

import {
  createDataSourceOptions,
} from './datasource-options.factory.js';

export const createNestTypeOrmOptions = (
  envService: EnvService,
): TypeOrmModuleOptions => ({
  ...createDataSourceOptions(envService),

  autoLoadEntities: true,

  retryAttempts: 5,

  retryDelay: 3000,
});
