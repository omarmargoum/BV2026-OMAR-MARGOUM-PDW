import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import {
  BasePersistenceEntity,
} from '../../../../common/database/index.js';

import {
  AuthSessionEntity,
} from './auth-session.entity.js';

@Entity({
  name: 'auth_refresh_token',
})
@Index(
  'uq_auth_refresh_token_token_hash',
  [
    'tokenHash',
  ],
  {
    unique: true,
  },
)
@Index(
  'idx_auth_refresh_token_session_id',
  [
    'sessionId',
  ],
)
@Index(
  'idx_auth_refresh_token_expires_at',
  [
    'expiresAt',
  ],
)
export class AuthRefreshTokenEntity
  extends BasePersistenceEntity
{
  @Column({
    name: 'session_id',
    type: 'varchar',
    length: 26,
  })
  sessionId!: string;

  @ManyToOne(
    () => AuthSessionEntity,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'session_id',
  })
  session!: AuthSessionEntity;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 64,
    select: false,
  })
  tokenHash!: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  @Column({
    name: 'used_at',
    type: 'timestamptz',
    nullable: true,
  })
  usedAt!: Date | null;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;

  @Column({
    name: 'replaced_by_token_id',
    type: 'varchar',
    length: 26,
    nullable: true,
  })
  replacedByTokenId!: string | null;
}