import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  AccountEntity,
} from '../entity/index.js';

import {
  AccountStatus,
} from '../enum/index.js';

export class AccountResponseDto {
  @ApiProperty({
    example: '01K8X4E6R7T9Y2U3I4O5P6Q7W8',
    description:
      'Identifiant ULID unique du compte',
  })
  id!: string;

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.Pending,
    description:
      'État actuel du compte',
  })
  status!: AccountStatus;

  @ApiProperty({
    example: '2026-10-30T09:00:00.000Z',
    description:
      'Date de création du compte',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-10-30T09:00:00.000Z',
    description:
      'Date de dernière modification du compte',
  })
  updatedAt!: string;

  @ApiProperty({
    example: 1,
    description:
      'Version utilisée pour le contrôle des mises à jour concurrentes',
  })
  version!: number;

  static fromEntity(
    entity: AccountEntity,
  ): AccountResponseDto {
    const dto =
      new AccountResponseDto();

    dto.id = entity.id;
    dto.status = entity.status;
    dto.createdAt =
      entity.createdAt.toISOString();
    dto.updatedAt =
      entity.updatedAt.toISOString();
    dto.version = entity.version;

    return dto;
  }
}