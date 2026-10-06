import {
  ConsoleLogger,
  Injectable,
} from '@nestjs/common';

import {
  redactSensitiveData,
} from './logging-redaction.js';

@Injectable()
export class AppLoggerService extends ConsoleLogger {
  log(
    message: unknown,
    context?: string,
  ): void {
    super.log(
      this.formatLogMessage(message),
      context,
    );
  }

  fatal(
    message: unknown,
    context?: string,
  ): void {
    super.fatal(
      this.formatLogMessage(message),
      context,
    );
  }

  error(
    message: unknown,
    stack?: string,
    context?: string,
  ): void {
    super.error(
      this.formatLogMessage(message),
      stack,
      context,
    );
  }

  warn(
    message: unknown,
    context?: string,
  ): void {
    super.warn(
      this.formatLogMessage(message),
      context,
    );
  }

  debug(
    message: unknown,
    context?: string,
  ): void {
    super.debug(
      this.formatLogMessage(message),
      context,
    );
  }

  verbose(
    message: unknown,
    context?: string,
  ): void {
    super.verbose(
      this.formatLogMessage(message),
      context,
    );
  }

  private formatLogMessage(
    message: unknown,
  ): string {
    const safeMessage =
      redactSensitiveData(message);

    if (typeof safeMessage === 'string') {
      return safeMessage;
    }

    try {
      return JSON.stringify(safeMessage);
    } catch {
      return String(safeMessage);
    }
  }
}