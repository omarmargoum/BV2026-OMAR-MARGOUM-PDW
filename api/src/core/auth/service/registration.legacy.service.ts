import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import {
  DataSource,
  QueryFailedError,
} from 'typeorm';

import {
  ApiCodeResponse,
  ApiException,
} from '../../../common/api/index.js';

import {
  AccountEntity,
  AccountResponseDto,
  AccountStatus,
} from '../../../core/account/data/index.js';

import {
  AuthIdentifierEntity,
  AuthIdentifierType,
  PasswordCredentialEntity,
  RegisterRequestDto,
} from '../data/index.js';

import {
  AuthIdentifierService,
} from './auth-identifier.service.js';

import {
  PasswordHashingService,
} from './password-hashing.service.js';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly dataSource:
      DataSource,

    private readonly passwordHashingService:
      PasswordHashingService,

    private readonly authIdentifierService:
      AuthIdentifierService,
  ) {}

  async register(
    input: RegisterRequestDto,
  ): Promise<AccountResponseDto> {
    const normalizedEmail =
      this.authIdentifierService
        .normalizeEmail(
          input.email,
        );

    const passwordHash =
      await this.passwordHashingService
        .hashPassword(
          input.password,
        );

    try {
      const account =
        await this.dataSource.transaction(
          async (
            transactionalManager,
          ): Promise<AccountEntity> => {
            const identifierRepository =
              transactionalManager.getRepository(
                AuthIdentifierEntity,
              );

            const existingIdentifier =
              await identifierRepository
                .findOne({
                  where: {
                    type:
                      AuthIdentifierType.Email,

                    normalizedValue:
                      normalizedEmail,
                  },
                });

            if (existingIdentifier) {
              throw new ConflictException();
            }

            const accountRepository =
              transactionalManager.getRepository(
                AccountEntity,
              );

            const credentialRepository =
              transactionalManager.getRepository(
                PasswordCredentialEntity,
              );

            const accountEntity =
              accountRepository.create({
                status:
                  AccountStatus.Pending,
              });

            const savedAccount =
              await accountRepository.save(
                accountEntity,
              );

            const identifier =
              identifierRepository.create({
                accountId:
                  savedAccount.id,

                type:
                  AuthIdentifierType.Email,

                value:
                  input.email.trim(),

                normalizedValue:
                  normalizedEmail,

                verifiedAt: null,
              });

            await identifierRepository.save(
              identifier,
            );

            const credential =
              credentialRepository.create({
                accountId:
                  savedAccount.id,

                passwordHash,

                passwordChangedAt:
                  new Date(),
              });

            await credentialRepository.save(
              credential,
            );

            return savedAccount;
          },
        );

      return AccountResponseDto.fromEntity(
        account,
      );
    } catch (error: unknown) {
      if (
        error instanceof
        ConflictException
      ) {
        throw this.createIdentifierConflict();
      }

      if (
        this.isUniqueViolation(error)
      ) {
        throw this.createIdentifierConflict();
      }

      throw error;
    }
  }

  private createIdentifierConflict():
    ApiException<null> {
    return new ApiException({
      statusCode: 409,

      code:
        ApiCodeResponse
          .AuthRegistrationIdentifierUnavailable,

      data: null,

      logMessage:
        'Registration identifier is unavailable',
    });
  }

  private isUniqueViolation(
    error: unknown,
  ): boolean {
    if (
      !(
        error instanceof
        QueryFailedError
      )
    ) {
      return false;
    }

    const driverError =
      error.driverError as {
        code?: string;
      };

    return (
      driverError.code === '23505'
    );
  }
}

