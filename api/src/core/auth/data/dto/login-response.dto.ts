import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  AccountResponseDto,
} from '../../../../core/account/data/index.js';

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
      'Identifiant ULID de la session',
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

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiJ9...',
    description:
      'Jeton JWT utilisé pour accéder aux routes protégées',
  })
  accessToken!: string;

  @ApiProperty({
    example: 900,
    description:
      'Durée de validité du jeton d’accès en secondes',
  })
  accessTokenExpiresInSeconds!: number;

  @ApiProperty({
    example:
      'W7_A8Z9kL3...',
    description:
      'Jeton opaque permettant de renouveler la session',
  })
  refreshToken!: string;

  @ApiProperty({
    example:
      '2026-11-29T13:00:00.000Z',
    description:
      'Date d’expiration du refresh token',
    format: 'date-time',
  })
  refreshTokenExpiresAt!: string;
}
