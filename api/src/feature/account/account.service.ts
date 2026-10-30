import {
  HttpStatus,  
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';
import {
  ApiCodeResponse,
  ApiException,
} from '../../common/api/index.js';

import {
  AccountEntity,
  AccountResponseDto,
  AccountStatus,
} from './data/index.js';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository:
      Repository<AccountEntity>,
  ) {}

  async create():
    Promise<AccountResponseDto> {
    const account =
      this.accountRepository.create({
        status: AccountStatus.Pending,
      });

    const savedAccount =
      await this.accountRepository.save(
        account,
      );

    return AccountResponseDto.fromEntity(
      savedAccount,
    );
  }

  async findById(
    id: string,
  ): Promise<AccountResponseDto> {
    const account =
      await this.accountRepository.findOne({
        where: {
          id,
        },
      });

    if (!account) {
      throw new ApiException({
        statusCode:
          HttpStatus.NOT_FOUND,

        code:
          ApiCodeResponse
            .AccountNotFound,

        data: null,

        logMessage:
          `Account not found: ${id}`,
      });
    }

    return AccountResponseDto.fromEntity(
      account,
    );
  }
}