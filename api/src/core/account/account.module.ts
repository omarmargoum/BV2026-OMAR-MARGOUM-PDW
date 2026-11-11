import {
   Module
   } from '@nestjs/common';
import{
  TypeOrmModule,
}   from '@nestjs/typeorm';
import {
   AccountService 
  } from './account.service.js';
import{
  AccountEntity
} from './data/index.js';
import { 
  AccountController 
} from './controller/account.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
    ]),
  ],
  controllers: [
    AccountController,
  ],

  providers: [
    AccountService,
  ],

  exports: [
    TypeOrmModule,
    AccountService,
  ],
})


export class AccountModule {}
