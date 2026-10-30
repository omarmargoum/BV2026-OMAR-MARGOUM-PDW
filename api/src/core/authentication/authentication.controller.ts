import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import {
  AccountResponseDto,
} from '../../feature/account/data/index.js';

import {
  RegisterRequestDto,
} from './data/index.js';

import {
  RegistrationService,
} from './registration/index.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly registrationService:
      RegistrationService,
  ) {}

  @ApiOperation({
    summary:
      'Créer un compte utilisateur',
    description:
      'Crée le compte, l’identifiant de connexion et le credential de mot de passe dans une transaction unique.',
  })
  @ApiCreatedResponse({
    description:
      'Le compte a été créé avec succès.',
    type: AccountResponseDto,
  })
  @ApiConflictResponse({
    description:
      'L’identifiant de connexion est indisponible.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Les données envoyées ne respectent pas les règles de validation.',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body()
    input: RegisterRequestDto,
  ): Promise<AccountResponseDto> {
    return this.registrationService
      .register(input);
  }
}