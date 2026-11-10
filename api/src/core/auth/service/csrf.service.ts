import {
  Injectable,
} from '@nestjs/common';

import {
  createHash,
  timingSafeEqual,
} from 'node:crypto';

import type {
  Request,
} from 'express';

import {
  AuthSecurityException,
} from '../data/exception/auth-security.exception.js';

import {
  AuthSessionEntity,
} from '../data/entity/auth-session.entity.js';

@Injectable()
export class CsrfService {
  assertValid(
    request: Request,
    session: AuthSessionEntity,
  ): void {
    const token =
      request.header(
        'X-CSRF-Token',
      );

    if (
      !token ||
      token.length > 512
    ) {
      throw new AuthSecurityException(
        'api.security.csrf-invalid',
        403,
      );
    }

    const actual =
      Buffer.from(
        createHash('sha256')
          .update(token)
          .digest(),
      );

    const csrfTokenHash: unknown =
      Reflect.get(
        session,
        'csrfTokenHash',
      );

    if (
      typeof csrfTokenHash !== 'string'
    ) {
      throw new AuthSecurityException(
        'api.security.csrf-invalid',
        403,
      );
    }

    const expected =
      Buffer.from(
        csrfTokenHash,
        'hex',
      );

    if (
      actual.length !==
        expected.length ||
      !timingSafeEqual(
        actual,
        expected,
      )
    ) {
      throw new AuthSecurityException(
        'api.security.csrf-invalid',
        403,
      );
    }
  }
}