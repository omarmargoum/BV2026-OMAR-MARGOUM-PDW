import {
  ApiProperty,
} from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty({
    description:
      'Nouveau jeton JWT d’accès',
  })
  accessToken!: string;

  @ApiProperty({
    example: 900,
    description:
      'Durée du nouveau jeton d’accès en secondes',
  })
  accessTokenExpiresInSeconds!: number;

  @ApiProperty({
    description:
      'Nouveau refresh token remplaçant le précédent',
    writeOnly: true,
  })
  refreshToken!: string;

  @ApiProperty({
    format: 'date-time',
    description:
      'Date d’expiration du nouveau refresh token',
  })
  refreshTokenExpiresAt!: string;
}