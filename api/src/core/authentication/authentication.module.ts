import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import {
    AuthenticationController,
} from './authentication.controller.js';
import {
    AccountEntity,
} from '../../feature/account/data/index.js';
import {
  AuthIdentifierEntity,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  PasswordCredentialEntity,
} from './data/index.js';
import {
    AuthIdentifierService,
} from './identifier/index.js';
import {   
    AuthTokenService,
} from './token/index.js';
import {
  JwtModule,
} from '@nestjs/jwt';
import {
    LoginService,
} from './login/index.js';
import {
    RefreshTokenService,
} from './refresh-token/index.js';
import {
  RegistrationService,
} from './registration/index.js';
import {
  PasswordCredentialService,    
} from './credential/index.js';
import {
  PasswordHashingService,
} from './security/index.js';
import {
    SessionService,
} from './session/index.js';
@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
        AccountEntity,
        AuthIdentifierEntity,
        PasswordCredentialEntity,
        AuthSessionEntity,
        AuthRefreshTokenEntity,
    ]),
  ],
controllers: [  
    AuthenticationController
  ],
providers: [
    PasswordHashingService,
    PasswordCredentialService,
    AuthIdentifierService,
    RegistrationService,
    LoginService,
    SessionService,
    AuthTokenService,
    RefreshTokenService,
  ],
exports: [
    PasswordHashingService,
    PasswordCredentialService,
    AuthIdentifierService,
    RegistrationService,
    LoginService,
    SessionService,
    AuthTokenService,
    RefreshTokenService,
    ],
})
export class AuthenticationModule {}