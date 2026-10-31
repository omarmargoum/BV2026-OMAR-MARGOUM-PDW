import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LogoutRequestDto {
  @ApiProperty({
    description:
      'Refresh token associé à la session à fermer',
    writeOnly: true,
  })
  @IsString({
    message:
      'api.auth.logout.error.refresh-token.is-string',
  })
  @IsNotEmpty({
    message:
      'api.auth.logout.error.refresh-token.required',
  })
  refreshToken!: string;
}