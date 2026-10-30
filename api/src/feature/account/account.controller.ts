import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  AccountService,
} from './account.service.js';

import {
  AccountResponseDto,
} from './data/index.js';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService:
      AccountService,
  ) {}

  @ApiOperation({
    summary:
      'Créer un nouveau compte',
    description:
      'Crée un compte avec le statut initial pending.',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Le compte a été créé avec succès.',
    type: AccountResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  

  @ApiOperation({
    summary:
      'Rechercher un compte par son identifiant',
  })
  @ApiParam({
    name: 'id',
    description:
      'Identifiant ULID du compte',
    example:
      '01K8X4E6R7T9Y2U3I4O5P6Q7W8',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description:
      'Le compte a été trouvé.',
    type: AccountResponseDto,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'Aucun compte ne correspond à cet identifiant.',
  })
  @Get(':id')
  async findById(
    @Param('id')
    id: string,
  ): Promise<AccountResponseDto> {
    return this.accountService.findById(
      id,
    );
  }
}