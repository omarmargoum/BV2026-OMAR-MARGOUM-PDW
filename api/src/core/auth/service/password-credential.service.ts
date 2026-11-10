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
    private readonly credentialRepository:
      Repository<PasswordCredentialEntity>,

    private readonly passwordHashingService:
      PasswordHasherService,
  ) {}

  async createCredential(
    accountId: string,
    plainPassword: string,
  ): Promise<PasswordCredentialEntity> {
    const passwordHash =
      await this.passwordHashingService
        .hashPassword(plainPassword);

    const credential =
      this.credentialRepository.create({
        accountId,
        passwordHash,
        passwordChangedAt:
          new Date(),
      });

    return this.credentialRepository.save(
      credential,
    );
  }

  async verifyPassword(
    accountId: string,
    candidatePassword: string,
  ): Promise<boolean> {
    const credential =
      await this.findWithPasswordHash(
        accountId,
      );

    if (!credential) {
      return false;
    }

    const isValid =
      await this.passwordHashingService
        .verifyPassword(
          credential.passwordHash,
          candidatePassword,
        );

    if (!isValid) {
      return false;
    }

    await this.rehashIfNecessary(
      credential,
      candidatePassword,
    );

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
      await this.passwordHashingService
        .hashPassword(
          newPlainPassword,
        );

    credential.passwordChangedAt =
      new Date();

    await this.credentialRepository.save(
      credential,
    );
  }

  async existsForAccount(
    accountId: string,
  ): Promise<boolean> {
    return this.credentialRepository.exists({
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
    return this.credentialRepository
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
      this.passwordHashingService
        .needsRehash(
          credential.passwordHash,
        );

    if (!mustRehash) {
      return;
    }

    credential.passwordHash =
      await this.passwordHashingService
        .hashPassword(
          plainPassword,
        );

    credential.passwordChangedAt =
      new Date();

    await this.credentialRepository.save(
      credential,
    );
  }
}
