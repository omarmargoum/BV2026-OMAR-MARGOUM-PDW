import {
  z,
} from 'zod';

import {
  AppMode,
} from '../enum/app-mode.enum.js';

import {
  LogLevel,
} from '../enum/log-level.enum.js';

const booleanStringSchema =
  z
    .enum([
      'true',
      'false',
    ])
    .default(
      'false',
    );
const corsOriginsSchema =
  z
    .string()
    .trim()
    .min(
      1,
      'La variable APP_CORS_ORIGIN est obligatoire.',
    )
    .transform(
      (
        value,
        context,
      ): string[] => {
        const origins =
          value
            .split(',')
            .map(
              (
                origin,
              ): string =>
                origin.trim(),
            )
            .filter(Boolean);

        if (
          origins.length ===
            0 ||
          origins.includes('*')
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            message:
              'APP_CORS_ORIGIN doit contenir une liste explicite et ne peut pas utiliser *.',
          });

          return z.NEVER;
        }

        return origins;
      },
    );
export const environmentValidation =
  z.object({
    APP_CORS_ORIGIN:
    corsOriginsSchema,
    NODE_ENV:
      z
        .nativeEnum(
          AppMode,
        )
        .default(
          AppMode.Development,
        ),

    PORT:
      z
        .coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),

    LOG_LEVEL:
      z
        .nativeEnum(
          LogLevel,
        )
        .default(
          LogLevel.Info,
        ),

    DB_HOST:
      z
        .string()
        .trim()
        .min(
          1,
          'La variable DB_HOST est obligatoire.',
        )
        .default(
          '127.0.0.1',
        ),

    DB_PORT:
      z
        .coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(5432),

    DB_USERNAME:
      z
        .string()
        .trim()
        .min(
          1,
          'La variable DB_USERNAME est obligatoire.',
        ),

    DB_PASSWORD:
      z
        .string()
        .min(
          1,
          'La variable DB_PASSWORD est obligatoire.',
        ),

    DB_DATABASE:
      z
        .string()
        .trim()
        .min(
          1,
          'La variable DB_DATABASE est obligatoire.',
        ),

    DB_SYNC:
      booleanStringSchema,

    AUTH_ACCESS_TOKEN_SECRET:
      z
        .string()
        .min(
          1,
          'La variable AUTH_ACCESS_TOKEN_SECRET est obligatoire.',
        ),

    AUTH_REFRESH_TOKEN_SECRET:
      z
        .string()
        .min(
          1,
          'La variable AUTH_REFRESH_TOKEN_SECRET est obligatoire.',
        ),

    AUTH_ACCESS_TOKEN_EXPIRES_IN_SECONDS:
      z
        .coerce
        .number()
        .int()
        .positive()
        .default(900),

    AUTH_REFRESH_TOKEN_EXPIRES_IN_DAYS:
      z
        .coerce
        .number()
        .int()
        .positive()
        .default(30),
  });

export type EnvironmentValidation =
  z.infer<
    typeof environmentValidation
  >;

export const validateEnvironment = (
  config:
    Record<string, unknown>,
): EnvironmentValidation => {
  const result =
    environmentValidation
      .safeParse(
        config,
      );

  if (!result.success) {
    const details =
      result.error.issues
        .map(
          (
            issue,
          ): string =>
            `${issue.path.join('.')}: ${issue.message}`,
        )
        .join('; ');

    throw new Error(
      `Environment validation error: ${details}`,
    );
  }

  return result.data;
};