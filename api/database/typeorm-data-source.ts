import 'dotenv/config';

import {
  dirname,
  join,
} from 'node:path';

import {
  fileURLToPath,
} from 'node:url';

import {
  DataSource,
  type DataSourceOptions,
} from 'typeorm';

import {
  AccountEntity,
} from '../src/core/account/data/index.js';

import {
  AuthIdentifierEntity,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  PasswordCredentialEntity,
} from '../src/core/auth/data/index.js';

const currentFilePath =
  fileURLToPath(
    import.meta.url,
  );

const currentDirectory =
  dirname(
    currentFilePath,
  );

const getRequiredEnvironmentValue = (
  key: string,
): string => {
  const value =
    process.env[key];

  if (!value) {
    throw new Error(
      `La variable ${key} est obligatoire.`,
    );
  }

  return value;
};

const databasePort =
  Number(
    process.env.DB_PORT ??
      '5432',
  );

if (
  !Number.isInteger(
    databasePort,
  ) ||
  databasePort <= 0
) {
  throw new Error(
    'DB_PORT doit être un entier positif.',
  );
}

const options:
  DataSourceOptions = {
  type:
    'postgres',

  host:
    getRequiredEnvironmentValue(
      'DB_HOST',
    ),

  port:
    databasePort,

  username:
    getRequiredEnvironmentValue(
      'DB_USERNAME',
    ),

  password:
    getRequiredEnvironmentValue(
      'DB_PASSWORD',
    ),

  database:
    process.env
      .MIGRATION_DB_DATABASE ??
    getRequiredEnvironmentValue(
      'DB_DATABASE',
    ),

  entities: [
    AccountEntity,
    AuthIdentifierEntity,
    AuthRefreshTokenEntity,
    AuthSessionEntity,
    PasswordCredentialEntity,
  ],

  migrations: [
    join(
      currentDirectory,
      'migrations/*.js',
    ),
  ],

  migrationsTableName:
    'typeorm_migration',

  synchronize:
    false,

  migrationsRun:
    false,

  logging: [
    'error',
    'warn',
  ],
};

const typeormDataSource =
  new DataSource(
    options,
  );

export default typeormDataSource;