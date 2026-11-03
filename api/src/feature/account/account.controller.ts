import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  AccountService,
} from './account.service.js';

import {
  AccountResponseDto,
} from './data/index.js';

@ApiBearerAuth()
@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService:
      AccountService,
  ) {}

  @ApiOperation({
    summary:
      'Rechercher un compte par son identifiant',
  })
  @ApiParam({
    name: 'id',
    description:
      'Identifiant ULID du compte',
  })
  @ApiOkResponse({
    description:
      'Le compte a été trouvé.',
    type: AccountResponseDto,
  })
  @ApiNotFoundResponse({
    description:
      'Le compte demandé est introuvable.',
  })
  @Get(':id')
  async findById(
    @Param('id')
    id: string,
  ): Promise<AccountResponseDto> {
    return this.accountService
      .findById(id);
  }
}