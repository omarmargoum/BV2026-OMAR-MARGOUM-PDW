import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppMode, ConfigKey } from "./data/enum";


export type ValidatedEnviroment = {
  [key: string]: string | number | boolean | undefined;
};

@Injectable()
export class EnvService {
  constructor(
    private readonly configService: ConfigService<ValidatedEnviroment, true>,
  ) {}

  get<T = string>(key: string): T;
  get<T extends keyof ValidatedEnviroment>(key: T): ValidatedEnviroment[T];
  get<T = string>(key: string): T {
    const value = this.configService.get<T>(key as keyof ValidatedEnviroment);

    if (value === undefined) {
      throw new Error(`Environment variable "${key}" is not defined`);
    }

    return value;
  }

  get AppMode(): AppMode {
    return this.get(ConfigKey.APP_MODE) as AppMode;
  }
}