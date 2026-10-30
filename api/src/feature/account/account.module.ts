import {
   Module
   } from '@nestjs/common';
import{
  TypeOrmModule,
}   from '@nestjs/typeorm';
import {
   AccountService 
  } from './account.service';
import{
  AccountEntity
} from './data/index.js';
import { 
  AccountController 
} from './account.controller';

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
    AccountService,
  ],
})


export class AccountModule {}
