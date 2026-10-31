import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RefreshRequestDto {
  @ApiProperty({
    description:
      'Refresh token précédemment délivré lors de la connexion',
    writeOnly: true,
  })
  @IsString({
    message:
      'api.auth.refresh-token.error.is-string',
  })
  @IsNotEmpty({
    message:
      'api.auth.refresh-token.error.required',
  })
  refreshToken!: string;
}