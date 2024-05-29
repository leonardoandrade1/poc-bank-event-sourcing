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
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreateAccountCommand } from 'src/bank-account/domain/commands/account/create-account.command';
import { DepositMoneyCommand } from 'src/bank-account/domain/commands/transaction/deposit-money.command';
import { AccountDTO } from 'src/bank-account/infra/http/accounts/dto/account.dto';
import { AccountEventStoreRepository } from '../../repositories/account-event-store.repository';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { WithdrawMoneyCommand } from 'src/bank-account/domain/commands/transaction/withdraw-money.command';
import { DisableAccountCommand } from 'src/bank-account/domain/commands/account/disable-account.command';

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
    private readonly commandBus: CommandBus,
  ) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post()
  async createAccount(@Body() body: CreateAccountDto) {
    const account = await this.commandBus.execute(
      new CreateAccountCommand(body.documentNumber),
    );

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
    const transaction = await this.commandBus.execute(
      new DepositMoneyCommand({
        amount: body.amount,
        description: body.description,
        documentNumber,
        branch: accountBranch,
        account: accountNumber,
      }),
    );
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
    const transaction = await this.commandBus.execute(
      new WithdrawMoneyCommand({
        documentNumber,
        branch: accountBranch,
        account: accountNumber,
        amount: body.amount,
        description: body.description,
      }),
    );
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
    await this.commandBus.execute(
      new DisableAccountCommand(documentNumber, accountBranch, accountNumber),
    );
  }
}
