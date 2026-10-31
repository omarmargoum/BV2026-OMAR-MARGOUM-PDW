import {
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import type {
  AuthContext,
} from '../data/index.js';

type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

export const CurrentAuth =
  createParamDecorator(
    (
      _data: unknown,
      context: ExecutionContext,
    ): AuthContext | undefined => {
      const request =
        context
          .switchToHttp()
          .getRequest<AuthenticatedRequest>();

      return request.auth;
    },
  );