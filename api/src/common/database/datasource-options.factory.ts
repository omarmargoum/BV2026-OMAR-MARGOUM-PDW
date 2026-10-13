import type {
  DataSourceOptions,
} from 'typeorm';

import {
  AppMode,
  EnvService,
} from '../config/index.js';

export const createDataSourceOptions = (
  envService: EnvService,
): DataSourceOptions => {
  const synchronize: boolean =
    envService.appMode === AppMode.Production
      ? false
      : envService.databaseSynchronize;

  return {
    type: 'postgres',
    host: envService.databaseHost,
    port: envService.databasePort,
    username: envService.databaseUsername,
    password: envService.databasePassword,
    database: envService.databaseName,
    synchronize,
  };
};