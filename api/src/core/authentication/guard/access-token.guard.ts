import {
  type CanActivate,
  type ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
    IS_PUBLIC_KEY,
} from '../decorator/public.decorator.js';
import type {
  Request,
} from 'express';
import {
    Reflector,
} from '@nestjs/core';
import {
  ApiCodeResponse,
  ApiException,
} from '../../../common/api/index.js';

import type {
  AuthContext,
} from '../data/index.js';

import {
  SessionService,
} from '../session/index.js';

import {
  AuthTokenService,
} from '../token/index.js';

type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

@Injectable()
export class AccessTokenGuard
  implements CanActivate
{
  constructor(
    private readonly authTokenService:
      AuthTokenService,
    private readonly reflector:
      Reflector,
    private readonly sessionService:
      SessionService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const accessToken =
      this.extractBearerToken(
        request,
      );

    if (!accessToken) {
      throw this
        .createUnauthorizedException();
    }

    try {
      const payload =
        await this.authTokenService
          .verifyAccessToken(
            accessToken,
          );

      if (
        !payload.sub ||
        !payload.sid
      ) {
        throw this
          .createUnauthorizedException();
      }

      const session =
        await this.sessionService
          .findActiveSession(
            payload.sid,
          );

      if (
        !session ||
        session.accountId !==
          payload.sub
      ) {
        throw this
          .createUnauthorizedException();
      }
    const isPublic =
        this.reflector
        .getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
            );

            if (isPublic) {
            return true;
            }
    const request =
            context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();

        const accessToken =
            this.extractBearerToken(
            request,
            );
      request.auth = {
        accountId:
          payload.sub,

        sessionId:
          payload.sid,
      };

      return true;
    } catch (error: unknown) {
      if (
        error instanceof
        ApiException
      ) {
        throw error;
      }

      throw this
        .createUnauthorizedException();
    }
  }

  private extractBearerToken(
    request: Request,
  ): string | null {
    const authorization =
      request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [
      scheme,
      accessToken,
    ] = authorization.split(' ');

    if (
      scheme?.toLowerCase() !==
        'bearer' ||
      !accessToken
    ) {
      return null;
    }

    return accessToken;
  }

  private createUnauthorizedException():
    ApiException<null> {
    return new ApiException<null>({
      statusCode:
        HttpStatus.UNAUTHORIZED,

      code:
        ApiCodeResponse
          .AuthAccessUnauthorized,

      data: null,

      logMessage:
        'Access token validation failed',
    });
  }
}