import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';

import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import {
  AccountResponseDto,
} from '../../feature/account/data/index.js';

import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
} from './data/index.js';

import {
  LoginService,
} from './login/index.js';

import {
  RegistrationService,
} from './registration/index.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly registrationService:
      RegistrationService,

    private readonly loginService:
      LoginService,
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

  @ApiOperation({
    summary:
      'Vérifier les identifiants de connexion',
    description:
      'Vérifie l’adresse e-mail et le mot de passe. La création de session et de jetons sera ajoutée ensuite.',
  })
  @ApiOkResponse({
    description:
      'Les identifiants sont valides et une session a été créée.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Les identifiants sont invalides.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Les données envoyées ne respectent pas les règles de validation.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body()
    input: LoginRequestDto,
    @Ip()
    ipAddress: string,
    @Headers('user-agent')
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    return this.loginService.login(
      input,
      {
        ipAddress,
        userAgent:
            userAgent ?? null,
      },
    );
  }
}