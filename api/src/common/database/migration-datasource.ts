import 'dotenv/config';

import {
  join,
} from 'node:path';

import {
  DataSource,
  type DataSourceOptions,
} from 'typeorm';
import {
  AuthIdentifierEntity,
} from '../../core/authentication/data/entity/auth-identifier.entity.js';

import {
  AuthRefreshTokenEntity,
} from '../../core/authentication/data/entity/auth-refresh-token.entity.js';

import {
  AuthSessionEntity,
} from '../../core/authentication/data/entity/auth-session.entity.js';

import {
  PasswordCredentialEntity,
} from '../../core/authentication/data/entity/password-credential.entity.js';

import {
  AccountEntity,
} from '../../feature/account/data/entity/account.entity.js';

const requiredEnvironmentValue = (
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
  !Number.isInteger(databasePort) ||
  databasePort <= 0
) {
  throw new Error(
    'DB_PORT doit être un entier positif.',
  );
}

const options:
  DataSourceOptions = {
  type: 'postgres',

  host:
    requiredEnvironmentValue(
      'DB_HOST',
    ),

  port:
    databasePort,

  username:
    requiredEnvironmentValue(
      'DB_USERNAME',
    ),

  password:
    requiredEnvironmentValue(
      'DB_PASSWORD',
    ),

  database:
    process.env
      .MIGRATION_DB_DATABASE ??
    requiredEnvironmentValue(
      'DB_DATABASE',
    ),

  entities: [
    join(
      __dirname,
      '../../**/*.entity.js',
    ),
  ],

  migrations: [
    join(
      __dirname,
      'migration/*.js',
    ),
  ],

  migrationsTableName:
    'typeorm_migration',

  synchronize: false,

  migrationsRun: false,

  logging: [
    'error',
    'warn',
  ],
};

const migrationDataSource =
  new DataSource(options);

export default migrationDataSource;