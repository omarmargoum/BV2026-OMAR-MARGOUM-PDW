import {
  Injectable,
} from '@nestjs/common';

import {
  PasswordPolicyException,
} from '../data/exception/index.js';

export const PASSWORD_MIN_LENGTH =
  12;

export const PASSWORD_MAX_LENGTH =
  128;

@Injectable()
export class PasswordPolicyService {
  assertValid(
    password: string,
  ): void {
    if (
      typeof password !==
      'string'
    ) {
      throw new PasswordPolicyException();
    }

    if (
      password.length <
      PASSWORD_MIN_LENGTH
    ) {
      throw new PasswordPolicyException();
    }

    if (
      password.length >
      PASSWORD_MAX_LENGTH
    ) {
      throw new PasswordPolicyException();
    }
  }

  isValid(
    password: unknown,
  ): password is string {
    return (
      typeof password ===
        'string' &&
      password.length >=
        PASSWORD_MIN_LENGTH &&
      password.length <=
        PASSWORD_MAX_LENGTH
    );
  }
}