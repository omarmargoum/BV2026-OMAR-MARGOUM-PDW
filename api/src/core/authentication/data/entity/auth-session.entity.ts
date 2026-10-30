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
  AccountEntity,
} from '../../../../feature/account/data/index.js';

@Entity({
  name: 'auth_session',
})
@Index(
  'idx_auth_session_account_id',
  [
    'accountId',
  ],
)
@Index(
  'idx_auth_session_expires_at',
  [
    'expiresAt',
  ],
)
export class AuthSessionEntity
  extends BasePersistenceEntity
{
  @Column({
    name: 'account_id',
    type: 'varchar',
    length: 26,
  })
  accountId!: string;

  @ManyToOne(
    () => AccountEntity,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'account_id',
  })
  account!: AccountEntity;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;

  @Column({
    name: 'last_seen_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastSeenAt!: Date | null;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress!: string | null;

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent!: string | null;
}