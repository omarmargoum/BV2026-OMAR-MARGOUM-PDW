/* import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ConfigKey,
} from './data/enum/index.js';

@Injectable()
export class EnvService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  get port(): number {
    const value = this.configService.get<string>(
      ConfigKey.port,
      '3000',
    );

    return Number(value);
  }
} */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AppMode,
  ConfigKey,
  LogLevel,
} from './data/enum/index.js';

@Injectable()
export class EnvService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  get appMode(): AppMode {
    return this.configService.get<AppMode>(
      ConfigKey.APP_MODE,
      AppMode.Development,
    );
  }

  get port(): number {
    const value = this.configService.get<string>(
      ConfigKey.PORT,
      '3000',
    );

    return this.parsePort(value, ConfigKey.PORT);
  }
get logLevel(): LogLevel {
  return (
    this.configService.get<LogLevel>(
      ConfigKey.LOG_LEVEL,
    ) ?? LogLevel.Debug
  );
}
  get databaseHost(): string {
    return this.configService.getOrThrow<string>(
      ConfigKey.DATABASE_HOST,
    );
  }

  get databasePort(): number {
    const value =
      this.configService.getOrThrow<string>(
        ConfigKey.DATABASE_PORT,
      );

    return this.parsePort(
      value,
      ConfigKey.DATABASE_PORT,
    );
  }

  get databaseUsername(): string {
    return this.configService.getOrThrow<string>(
      ConfigKey.DATABASE_USERNAME,
    );
  }

  get databasePassword(): string {
    return this.configService.getOrThrow<string>(
      ConfigKey.DATABASE_PASSWORD,
    );
  }

  get databaseName(): string {
    return this.configService.getOrThrow<string>(
      ConfigKey.DATABASE_NAME,
    );
  }

  get databaseSynchronize(): boolean {
    const value = this.configService.get<string>(
      ConfigKey.DATABASE_SYNCHRONIZE,
      'false',
    );

    return this.parseBoolean(
      value,
      ConfigKey.DATABASE_SYNCHRONIZE,
    );
  }

  get isProduction(): boolean {
    return this.appMode === AppMode.Production;
  }

  private parsePort(
    value: string,
    key: string,
  ): number {
    const parsedValue = Number(value);

    if (
      !Number.isInteger(parsedValue) ||
      parsedValue < 1 ||
      parsedValue > 65535
    ) {
      throw new Error(
        `${key} doit être un entier compris entre 1 et 65535.`,
      );
    }

    return parsedValue;
  }

  private parseBoolean(
    value: string,
    key: string,
  ): boolean {
    const normalizedValue =
      value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }

    throw new Error(
      `${key} doit valoir true ou false.`,
    );
  }
}