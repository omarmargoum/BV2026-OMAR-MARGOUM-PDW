import { z } from "zod";
import { AppMode } from "../enum/app-mode.enum";
import { LogLevel } from "../enum/log-level.enum";

const environmentValidation = z.object({
  APP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_MODE: z.nativeEnum(AppMode).default(AppMode.DEVELOPMENT),
  DATABASE_URL: z.string().min(1, "La variable DATABASE_URL est requise"),
}); 
export type EnvironmentValidation = z.infer<typeof environmentValidation>;
export const validateEnvironment = (config: Record<string, unknown>): EnvironmentValidation => {
  const result = environmentValidation.safeParse(config);
  if (!result.success) {
    throw new Error(`Environment validation error: ${result.error.message}`);
  }          
  return result.data;
}