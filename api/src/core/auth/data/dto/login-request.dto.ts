import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    example: 'omar@example.com',
    description:
      'Adresse e-mail utilisée comme identifiant de connexion',
    maxLength: 320,
  })
  @IsEmail(
    {},
    {
      message:
        'api.auth.login.error.email.invalid',
    },
  )
  @IsNotEmpty({
    message:
      'api.auth.login.error.email.required',
  })
  @MaxLength(320, {
    message:
      'api.auth.login.error.email.max-length',
  })
  email!: string;

  @ApiProperty({
    example: 'MotDePasseSolide123!',
    description:
      'Mot de passe associé au compte',
    writeOnly: true,
  })
  @IsString({
    message:
      'api.auth.login.error.password.is-string',
  })
  @IsNotEmpty({
    message:
      'api.auth.login.error.password.required',
  })
  @MaxLength(128, {
    message:
      'api.auth.login.error.password.max-length',
  })
  password!: string;
}