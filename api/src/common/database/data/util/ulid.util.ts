import { ulid } from 'ulid';

export const createUlid = (): string => {
  return ulid();
};