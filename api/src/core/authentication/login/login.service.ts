import {
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  ApiCodeResponse,
  ApiException,
} from '../../../common/api/index.js';

import {
  AccountEntity,
  AccountResponseDto,
  AccountStatus,
} from '../../../feature/account/data/index.js';

import {
  PasswordCredentialService,
} from '../credential/index.js';

import {
  LoginRequestDto,
  LoginResponseDto,
} from '../data/index.js';
import {
    type CreateSessionOptions,
    SessionService,
} from '../session/index.js';
import {
  AuthIdentifierService,
} from '../identifier/index.js';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository:
      Repository<AccountEntity>,

    private readonly authIdentifierService:
      AuthIdentifierService,

    private readonly passwordCredentialService:
      PasswordCredentialService,

    private readonly sessionService:
      SessionService,
  ) {}

  async login(
    input: LoginRequestDto,
    sessionOptions: 
    CreateSessionOptions ={},
  ): Promise<LoginResponseDto> {
    const identifier =
      await this.authIdentifierService
        .findEmailIdentifier(
          input.email,
        );

    if (!identifier) {
      throw this.createInvalidCredentialsException();
    }

    const account =
      await this.accountRepository.findOne({
        where: {
          id: identifier.accountId,
        },
      });

    if (
      !account ||
      account.status ===
        AccountStatus.Disabled
    ) {
      throw this.createInvalidCredentialsException();
    }

    const passwordIsValid =
      await this.passwordCredentialService
        .verifyPassword(
          account.id,
          input.password,
        );

    if (!passwordIsValid) {
      throw this.createInvalidCredentialsException();
    }

    const session = 
    await this.sessionService
    .createSession(
      
       account.id,
        sessionOptions,
      
    );
    const response =new LoginResponseDto();
    response.account = AccountResponseDto.fromEntity(account);
    response.sessionId = session.id;
    response.sessionExpiresAt = session.expiresAt.toISOString();
    return response;
  }

  private createInvalidCredentialsException():
    ApiException<null> {
    return new ApiException<null>({
      statusCode:
        HttpStatus.UNAUTHORIZED,

      code:
        ApiCodeResponse
          .AuthLoginInvalidCredentials,

      data: null,

      logMessage:
        'Authentication failed because the credentials are invalid',
    });
  }
}