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
  LogoutRequestDto,
  LogoutResponseDto,
  RegisterRequestDto,
  RefreshRequestDto, 
  RefreshResponseDto,
} from './data/index.js';

import {
  LoginService,
} from './login/index.js';
import {
  LogoutService,
} from './logout/index.js';
import {
  TokenRotationService,
} from './refresh-token/index.js';
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
    private readonly tokenRotationService:
      TokenRotationService,
    private readonly logoutService:
      LogoutService,
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
  @ApiOperation({
    summary:
      'Renouveler les jetons d’authentification',
    description:
      'Invalide le refresh token actuel et délivre une nouvelle paire de jetons.',
  })
  @ApiOkResponse({
    description:
      'Les jetons ont été renouvelés.',
    type: RefreshResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'Le refresh token est invalide, expiré, utilisé ou révoqué.',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Le corps de la requête est invalide.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body()
    input: RefreshRequestDto,
  ): Promise<RefreshResponseDto> {
    return this.tokenRotationService
      .rotate(input);
  }
 @ApiOperation({
  summary:
    'Fermer une session utilisateur',
  description:
    'Révoque la session et tous les refresh tokens qui lui sont associés.',
})
@ApiOkResponse({
  description:
    'La déconnexion a été traitée.',
  type: LogoutResponseDto,
})
@ApiUnprocessableEntityResponse({
  description:
    'Le corps de la requête est invalide.',
})
@HttpCode(HttpStatus.OK)
@Post('logout')
async logout(
  @Body()
  input: LogoutRequestDto,
): Promise<LogoutResponseDto> {
  return this.logoutService.logout(
    input,
  );
}
}

