import { 
  ulid 
} from 'ulid';
const ULID_PATTERN =
  /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i;

export const isValidUlid = (
  value: unknown,
): value is string =>
  typeof value ===
    'string' &&
  ULID_PATTERN.test(
    value,
  );
export const createUlid = (): string => {
  return ulid();
};