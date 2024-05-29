import { faker } from '@faker-js/faker';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountDTO } from 'src/bank-account/infra/http/accounts/dto/account.dto';
import { Account } from '../../../domain/entities/account.entity';
import { AccountEventStoreRepository } from '../../repositories/account-event-store.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { TransactionRepository } from '../../repositories/transaction.repository';

// TODO: account
// 1. accept create account request and return account number and branch
// 2. async: complete account creation process

// TODO: Transferencia
// 1. async: send transaction to antifraud in order to approve or reject and then complete this transaction
// 2. approved: complete transaction and generate account transaciton event
// 3. reprovado: complete transaction and save transaction rejection reason

@ApiTags('Account')
@Controller('document')
export class AccountController {
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post()
  async createAccount(@Body() body: CreateAccountDto) {
    const accountNumber = faker.finance.accountNumber(6);
    const accountBranch = faker.finance.accountNumber(4);
    const account = Account.Create(
      body.documentNumber,
      accountNumber,
      accountBranch,
    );

    await this.accountEventStoreRepository.save(account);
    account.commitEvents();
    // TODO: dispatch event to finish aacount register

    const dto = AccountDTO.FromAccount(account);
    return dto;
  }

  @Get('/:documentNumber/branch/:accountBranch/account/:accountNumber')
  async fetchAccount(
    @Param('documentNumber') documentNumber: string,
    @Param('accountBranch') accountBranch: string,
    @Param('accountNumber') accountNumber: string,
  ) {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        accountBranch,
        accountNumber,
      );
    if (!account) throw new NotFoundException('Account not found');

    const dto = AccountDTO.FromAccount(account);
    return dto;
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/:documentNumber/branch/:accountBranch/account/:accountNumber/deposit')
  async depositMoney(
    @Param('documentNumber') documentNumber: string,
    @Param('accountBranch') accountBranch: string,
    @Param('accountNumber') accountNumber: string,
    @Body() body: CreateDepositDto,
  ) {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        accountBranch,
        accountNumber,
      );
    if (!account) throw new NotFoundException('Account not found');
    const transaction = account.deposit(body.amount, body.description);
    await this.accountEventStoreRepository.save(account);
    await this.transactionRepository.save(transaction);
    account.commitEvents();
    return {
      transactionId: transaction.transactionId,
    };
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post(
    '/:documentNumber/branch/:accountBranch/account/:accountNumber/withdraw',
  )
  async withdrawMoney(
    @Param('documentNumber') documentNumber: string,
    @Param('accountBranch') accountBranch: string,
    @Param('accountNumber') accountNumber: string,
    @Body() body: CreateWithdrawDto,
  ) {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        accountBranch,
        accountNumber,
      );
    if (!account) throw new NotFoundException('Account not found');
    const transaction = account.withdraw(body.amount, body.description);
    await this.accountEventStoreRepository.save(account);
    await this.transactionRepository.save(transaction);
    account.commitEvents();
    return {
      transactionId: transaction.transactionId,
    };
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Patch(
    '/:documentNumber/branch/:accountBranch/account/:accountNumber/disable',
  )
  async disableAccount(
    @Param('documentNumber') documentNumber: string,
    @Param('accountBranch') accountBranch: string,
    @Param('accountNumber') accountNumber: string,
  ) {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        accountBranch,
        accountNumber,
      );
    if (!account) throw new NotFoundException('Account not found');
    account.disable();
    await this.accountEventStoreRepository.save(account);
    account.commitEvents();
    return;
  }
}
