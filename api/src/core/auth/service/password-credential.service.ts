import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  PasswordCredentialEntity,
} from '../data/entity/password-credential.entity.js';

import {
  PasswordHasherService,
} from './password-hasher.service.js';

@Injectable()
export class PasswordCredentialService {
  constructor(
    @InjectRepository(
      PasswordCredentialEntity,
    )
    private readonly passwordCredentialRepository:
      Repository<PasswordCredentialEntity>,

    private readonly passwordHasherService:
      PasswordHasherService,
  ) {}

  async createCredential(
    accountId: string,
    plainPassword: string,
  ): Promise<PasswordCredentialEntity> {
    const passwordHash =
      await this.passwordHasherService
        .hashPassword(plainPassword);

    const credential =
      this.passwordCredentialRepository.create({
        accountId,
        passwordHash,
        passwordChangedAt:
          new Date(),
      });

    return this.passwordCredentialRepository.save(
      credential,
    );
  }

 async verifyPassword(
  accountId: string,
  password: string,
): Promise<boolean> {
  const credential =
    await this
      .passwordCredentialRepository
      .createQueryBuilder(
        'credential',
      )
      .addSelect(
        'credential.passwordHash',
      )
      .where(
        'credential.accountId = :accountId',
        {
          accountId,
        },
      )
      .getOne();

  if (!credential) {
    return false;
  }

  const passwordIsValid =
    await this
      .passwordHasherService
      .verifyPassword(
        credential.passwordHash,
        password,
      );

  if (!passwordIsValid) {
    return false;
  }

  const hashMustBeRecalculated =
    this.passwordHasherService
      .needsRehash(
        credential.passwordHash,
      );

  if (
    hashMustBeRecalculated
  ) {
    credential.passwordHash =
      await this
        .passwordHasherService
        .hashPassword(
          password,
        );

    credential.passwordChangedAt =
      new Date();

    await this
      .passwordCredentialRepository
      .save(
        credential,
      );
  }

  return true;
}

  async changePassword(
    accountId: string,
    newPlainPassword: string,
  ): Promise<void> {
    const credential =
      await this.findWithPasswordHash(
        accountId,
      );

    if (!credential) {
      return;
    }

    credential.passwordHash =
      await this.passwordHasherService
        .hashPassword(
          newPlainPassword,
        );

    credential.passwordChangedAt =
      new Date();

    await this.passwordCredentialRepository.save(
      credential,
    );
  }

  async existsForAccount(
    accountId: string,
  ): Promise<boolean> {
    return this.passwordCredentialRepository.exists({
      where: {
        accountId,
      },
    });
  }

  private async findWithPasswordHash(
    accountId: string,
  ): Promise<
    PasswordCredentialEntity | null
  > {
    return this.passwordCredentialRepository
      .createQueryBuilder(
        'credential',
      )
      .addSelect(
        'credential.passwordHash',
      )
      .where(
        'credential.accountId = :accountId',
        {
          accountId,
        },
      )
      .getOne();
  }

  private async rehashIfNecessary(
    credential:
      PasswordCredentialEntity,
    plainPassword: string,
  ): Promise<void> {
    const mustRehash =
      this.passwordHasherService
        .needsRehash(
          credential.passwordHash,
        );

    if (!mustRehash) {
      return;
    }

    credential.passwordHash =
      await this.passwordHasherService
        .hashPassword(
          plainPassword,
        );

    credential.passwordChangedAt =
      new Date();

    await this.passwordCredentialRepository.save(
      credential,
    );
  }
}
