import {
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import {
  createUlid,
} from '../util/index.js';

export abstract class BasePersistenceEntity {
  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
    length: 26,
  })
  id!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @VersionColumn({
    name: 'version',
    type: 'integer',
  })
  version!: number;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) {
      this.id = createUlid();
    }
  }
}