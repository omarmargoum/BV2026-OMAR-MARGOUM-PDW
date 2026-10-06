import { Injectable } from '@nestjs/common';
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
}