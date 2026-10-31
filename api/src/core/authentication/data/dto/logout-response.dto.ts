import {
  ApiProperty,
} from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Indique que la déconnexion a été traitée',
  })
  loggedOut!: boolean;
}