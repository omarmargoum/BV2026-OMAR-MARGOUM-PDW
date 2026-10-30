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
  AuthSessionEntity,
} from '../data/index.js';

const SESSION_DURATION_DAYS = 30;

export type CreateSessionOptions = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(
      AuthSessionEntity,
    )
    private readonly sessionRepository:
      Repository<AuthSessionEntity>,
  ) {}

  async createSession(
    accountId: string,
    options: CreateSessionOptions = {},
  ): Promise<AuthSessionEntity> {
    const now = new Date();

    const expiresAt = new Date(
      now.getTime() +
        SESSION_DURATION_DAYS *
          24 *
          60 *
          60 *
          1000,
    );

    const session =
      this.sessionRepository.create({
        accountId,
        expiresAt,
        revokedAt: null,
        lastSeenAt: now,
        ipAddress:
          options.ipAddress ?? null,
        userAgent:
          options.userAgent ?? null,
      });

    return this.sessionRepository.save(
      session,
    );
  }

  async findActiveSession(
    sessionId: string,
  ): Promise<AuthSessionEntity | null> {
    const session =
      await this.sessionRepository.findOne({
        where: {
          id: sessionId,
        },
      });

    if (!session) {
      return null;
    }

    if (session.revokedAt) {
      return null;
    }

    if (
      session.expiresAt.getTime() <=
      Date.now()
    ) {
      return null;
    }

    return session;
  }

  async revokeSession(
    sessionId: string,
  ): Promise<boolean> {
    const session =
      await this.sessionRepository.findOne({
        where: {
          id: sessionId,
        },
      });

    if (!session) {
      return false;
    }

    if (session.revokedAt) {
      return true;
    }

    session.revokedAt = new Date();

    await this.sessionRepository.save(
      session,
    );

    return true;
  }
}