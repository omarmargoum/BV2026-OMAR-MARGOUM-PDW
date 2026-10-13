/*export enum ConfigKey {
  APP_MODE = 'APP_MODE',
  LOG_LEVEL = 'LOG_LEVEL',
  port = 'PORT',
}*/
export enum ConfigKey {
  APP_MODE = 'NODE_ENV',
  PORT = 'PORT',
  LOG_LEVEL = 'LOG_LEVEL',

  DATABASE_HOST = 'DB_HOST',
  DATABASE_PORT = 'DB_PORT',
  DATABASE_USERNAME = 'postgres',
  DATABASE_PASSWORD = 'admin',
  DATABASE_NAME = 'postgres',
  DATABASE_SYNCHRONIZE = 'DB_SYNC',
}