import {
  ApiProperty,
} from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto {
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
        'api.auth.registration.error.email.invalid',
    },
  )
  @IsNotEmpty({
    message:
      'api.auth.registration.error.email.required',
  })
  @MaxLength(320, {
    message:
      'api.auth.registration.error.email.max-length',
  })
  email!: string;

  @ApiProperty({
    example: 'MotDePasseSolide123!',
    description:
      'Mot de passe du nouveau compte',
    minLength: 12,
    writeOnly: true,
  })
  @IsString({
    message:
      'api.auth.registration.error.password.is-string',
  })
  @IsNotEmpty({
    message:
      'api.auth.registration.error.password.required',
  })
  @MinLength(12, {
    message:
      'api.auth.registration.error.password.min-length',
  })
  @MaxLength(128, {
    message:
      'api.auth.registration.error.password.max-length',
  })
  password!: string;
}