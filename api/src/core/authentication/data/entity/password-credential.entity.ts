import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import {
  BasePersistenceEntity,
} from '../../../../common/database/index.js';

import {
  AccountEntity,
} from '../../../../feature/account/data/index.js';

@Entity({
  name: 'password_credential',
})
@Index(
  'uq_password_credential_account_id',
  [
    'accountId',
  ],
  {
    unique: true,
  },
)
export class PasswordCredentialEntity
  extends BasePersistenceEntity
{
  @Column({
    name: 'account_id',
    type: 'varchar',
    length: 26,
  })
  accountId!: string;

  @OneToOne(
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
    name: 'password_hash',
    type: 'text',
    select: false,
  })
  passwordHash!: string;

  @Column({
    name: 'password_changed_at',
    type: 'timestamptz',
    nullable: true,
  })
  passwordChangedAt!: Date | null;
}