import {
  Column,
  Entity,
} from 'typeorm';

import {
  BasePersistenceEntity,
} from '../../../../common/database/index.js';

import {
  AccountStatus,
} from '../enum/index.js';

@Entity({
  name: 'account',
})
export class AccountEntity
  extends BasePersistenceEntity
{
  @Column({
    name: 'status',
    type: 'enum',
    enum: AccountStatus,
    enumName: 'account_status',
    default: AccountStatus.Pending,
  })
  status!: AccountStatus;
}