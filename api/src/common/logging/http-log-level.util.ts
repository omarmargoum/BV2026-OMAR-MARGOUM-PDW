import type { LogLevel } from '@nestjs/common';

export const getHttpLogLevel = (
  statusCode: number,
): LogLevel => {
  if (statusCode >= 500) {
    return 'error';
  }

  if (statusCode >= 400) {
    return 'warn';
  }

  return 'log';
};