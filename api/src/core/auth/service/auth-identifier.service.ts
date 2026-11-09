import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  AuthIdentifierEntity,
  AuthIdentifierType,
} from '../data/index.js';

@Injectable()
export class AuthIdentifierService {
  constructor(
    @InjectRepository(
      AuthIdentifierEntity,
    )
    private readonly identifierRepository:
      Repository<AuthIdentifierEntity>,
  ) {}

  normalizeEmail(
    email: string,
  ): string {
    return email
      .trim()
      .toLowerCase();
  }

  async createEmailIdentifier(
    accountId: string,
    email: string,
  ): Promise<AuthIdentifierEntity> {
    const normalizedValue =
      this.normalizeEmail(email);

    const alreadyExists =
      await this.existsByTypeAndValue(
        AuthIdentifierType.Email,
        normalizedValue,
      );

    if (alreadyExists) {
      throw new ConflictException(
        'api.auth.identifier.already-exists',
      );
    }

    const identifier =
      this.identifierRepository.create({
        accountId,
        type:
          AuthIdentifierType.Email,
        value: email.trim(),
        normalizedValue,
        verifiedAt: null,
      });

    return this.identifierRepository.save(
      identifier,
    );
  }

  async findEmailIdentifier(
    email: string,
  ): Promise<AuthIdentifierEntity | null> {
    const normalizedValue =
      this.normalizeEmail(email);

    return this.findByTypeAndValue(
      AuthIdentifierType.Email,
      normalizedValue,
    );
  }

  async findByTypeAndValue(
    type: AuthIdentifierType,
    normalizedValue: string,
  ): Promise<AuthIdentifierEntity | null> {
    return this.identifierRepository.findOne({
      where: {
        type,
        normalizedValue,
      },
    });
  }

  async existsByEmail(
    email: string,
  ): Promise<boolean> {
    return this.existsByTypeAndValue(
      AuthIdentifierType.Email,
      this.normalizeEmail(email),
    );
  }

  async markAsVerified(
    identifierId: string,
  ): Promise<boolean> {
    const identifier =
      await this.identifierRepository.findOne({
        where: {
          id: identifierId,
        },
      });

    if (!identifier) {
      return false;
    }

    if (identifier.verifiedAt) {
      return true;
    }

    identifier.verifiedAt =
      new Date();

    await this.identifierRepository.save(
      identifier,
    );

    return true;
  }

  private async existsByTypeAndValue(
    type: AuthIdentifierType,
    normalizedValue: string,
  ): Promise<boolean> {
    return this.identifierRepository.exists({
      where: {
        type,
        normalizedValue,
      },
    });
  }
}