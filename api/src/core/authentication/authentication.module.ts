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
  AuthIdentifierEntity,
  AuthRefreshTokenEntity,
  AuthSessionEntity,
  PasswordCredentialEntity,
} from './data/index.js';
import {
    AuthIdentifierService,
} from './identifier/index.js';
import {
  RegistrationService,
} from './registration/index.js';
import {
  PasswordCredentialService,    
} from './credential/index.js';
import {
  PasswordHashingService,
} from './security/index.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
  ],
exports: [
    PasswordHashingService,
    PasswordCredentialService,
    AuthIdentifierService,
    RegistrationService,
  ],
})
export class AuthenticationModule {}