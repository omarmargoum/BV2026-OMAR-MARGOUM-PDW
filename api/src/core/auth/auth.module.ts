import {
  Module,
} from '@nestjs/common';

import {
  APP_GUARD,
} from '@nestjs/core';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  AccountModule,
} from '../account/index.js';

import {
  AuthController,
} from './controller/auth.controller.js';

import {
  AuthIdentifierEntity,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  PasswordCredentialEntity,
} from './data/index.js';

import {
  AccessAuthGuard,
  OriginGuard,
} from './guard/index.js';

import {
  AuthCookieService,
  AuthIdentifierService,
  AuthService,
  AuthSessionService,
  CsrfService,
  PasswordCredentialService,
  PasswordHasherService,
  PasswordPolicyService,
  RefreshTokenService,
  TokenCryptoService,
} from './service/index.js';

@Module({
  imports: [
    AccountModule,

    JwtModule.register({}),

    TypeOrmModule.forFeature([
      AuthIdentifierEntity,
      PasswordCredentialEntity,
      AuthSessionEntity,
      AuthRefreshTokenEntity,
    ]),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    AuthCookieService,
    AuthIdentifierService,
    AuthSessionService,
    CsrfService,
    PasswordCredentialService,
    PasswordHasherService,
    PasswordPolicyService,
    RefreshTokenService,
    TokenCryptoService,

    OriginGuard,
    AccessAuthGuard,

    {
      provide:
        APP_GUARD,

      useExisting:
        OriginGuard,
    },

    {
      provide:
        APP_GUARD,

      useExisting:
        AccessAuthGuard,
    },
  ],

  exports: [
    AuthService,
    AuthCookieService,
    AuthIdentifierService,
    AuthSessionService,
    CsrfService,
    PasswordCredentialService,
    PasswordHasherService,
    PasswordPolicyService,
    RefreshTokenService,
    TokenCryptoService,
  ],
})
export class AuthModule {}