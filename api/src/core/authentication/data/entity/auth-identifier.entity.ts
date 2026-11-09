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
} from '../../../../core/account/data/index.js';

import {
  AuthIdentifierType,
} from '../enum/index.js';

@Entity({
  name: 'auth_identifier',
})
@Index(
  'uq_auth_identifier_type_normalized_value',
  [
    'type',
    'normalizedValue',
  ],
  {
    unique: true,
  },
)
@Index(
  'idx_auth_identifier_account_id',
  [
    'accountId',
  ],
)
export class AuthIdentifierEntity
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
    name: 'type',
    type: 'enum',
    enum: AuthIdentifierType,
    enumName: 'auth_identifier_type',
  })
  type!: AuthIdentifierType;

  @Column({
    name: 'value',
    type: 'varchar',
    length: 320,
  })
  value!: string;

  @Column({
    name: 'normalized_value',
    type: 'varchar',
    length: 320,
  })
  normalizedValue!: string;

  @Column({
    name: 'verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  verifiedAt!: Date | null;
}
