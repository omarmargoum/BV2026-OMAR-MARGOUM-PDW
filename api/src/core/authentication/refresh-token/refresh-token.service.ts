import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  IsNull,
  MoreThan,
  Repository,
} from 'typeorm';

import {
  AuthRefreshTokenEntity,
} from '../data/index.js';

import {
  AuthTokenService,
} from '../token/index.js';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(
      AuthRefreshTokenEntity,
    )
    private readonly refreshTokenRepository:
      Repository<AuthRefreshTokenEntity>,

    private readonly authTokenService:
      AuthTokenService,
  ) {}

  async createRefreshToken(
    sessionId: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<AuthRefreshTokenEntity> {
    const tokenHash =
      this.authTokenService
        .hashRefreshToken(
          refreshToken,
        );

    const entity =
      this.refreshTokenRepository.create({
        sessionId,
        tokenHash,
        expiresAt,
        usedAt: null,
        revokedAt: null,
        replacedByTokenId: null,
      });

    return this.refreshTokenRepository.save(
      entity,
    );
  }

  async findActiveByRawToken(
    refreshToken: string,
  ): Promise<AuthRefreshTokenEntity | null> {
    const tokenHash =
      this.authTokenService
        .hashRefreshToken(
          refreshToken,
        );

    return this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        revokedAt: IsNull(),
        expiresAt: MoreThan(
          new Date(),
        ),
      },
    });
  }

  async markAsUsed(
    tokenId: string,
    replacedByTokenId:
      string | null = null,
  ): Promise<boolean> {
    const token =
      await this.refreshTokenRepository
        .findOne({
          where: {
            id: tokenId,
          },
        });

    if (!token) {
      return false;
    }

    if (token.usedAt) {
      return true;
    }

    token.usedAt = new Date();
    token.replacedByTokenId =
      replacedByTokenId;

    await this.refreshTokenRepository.save(
      token,
    );

    return true;
  }

  async revokeToken(
    tokenId: string,
  ): Promise<boolean> {
    const token =
      await this.refreshTokenRepository
        .findOne({
          where: {
            id: tokenId,
          },
        });

    if (!token) {
      return false;
    }

    if (token.revokedAt) {
      return true;
    }

    token.revokedAt = new Date();

    await this.refreshTokenRepository.save(
      token,
    );

    return true;
  }

  async revokeAllForSession(
    sessionId: string,
  ): Promise<number> {
    const result =
      await this.refreshTokenRepository
        .createQueryBuilder()
        .update(
          AuthRefreshTokenEntity,
        )
        .set({
          revokedAt: new Date(),
        })
        .where(
          'session_id = :sessionId',
          {
            sessionId,
          },
        )
        .andWhere(
          'revoked_at IS NULL',
        )
        .execute();

    return result.affected ?? 0;
  }
}