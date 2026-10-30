import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  AccountResponseDto,
} from '../../../../feature/account/data/index.js';

export class LoginResponseDto {
  @ApiProperty({
    type: AccountResponseDto,
    description:
      'Informations publiques du compte connecté',
  })
  account!: AccountResponseDto;

  @ApiProperty({
    example:
      '01K8X4E6R7T9Y2U3I4O5P6Q7W8',
    description:
      'Identifiant ULID de la session créée',
  })
  sessionId!: string;

  @ApiProperty({
    example:
      '2026-11-29T13:00:00.000Z',
    description:
      'Date d’expiration de la session',
    format: 'date-time',
  })
  sessionExpiresAt!: string;
}