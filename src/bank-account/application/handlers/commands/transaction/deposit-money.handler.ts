import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DepositMoneyCommand } from 'src/bank-account/domain/commands/transaction/deposit-money.command';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { AccountEventStoreRepository } from '../../../../infra/repositories/account-event-store.repository';
import { TransactionRepository } from '../../../../infra/repositories/transaction.repository';

@CommandHandler(DepositMoneyCommand)
export class DepositMoneyCommandHandler
  implements ICommandHandler<DepositMoneyCommand>
{
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(command: DepositMoneyCommand): Promise<Transaction> {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        command.branch,
        command.account,
      );
    if (!account) throw new NotFoundException('Account not found');
    const transaction = account.deposit(command.amount, command.description);
    await this.accountEventStoreRepository.save(account);
    await this.transactionRepository.save(transaction);
    account.commitEvents();
    return transaction;
  }
}
