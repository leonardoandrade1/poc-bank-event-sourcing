import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WithdrawMoneyCommand } from 'src/bank-account/domain/commands/transaction/withdraw-money.command';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { AccountEventStoreRepository } from '../../../infra/repositories/account-event-store.repository';
import { TransactionRepository } from '../../../infra/repositories/transaction.repository';

@CommandHandler(WithdrawMoneyCommand)
export class WithdrawMoneyCommandHandler
  implements ICommandHandler<WithdrawMoneyCommand>
{
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(command: WithdrawMoneyCommand): Promise<Transaction> {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        command.branch,
        command.account,
      );
    if (!account) throw new NotFoundException('Account not found');
    const transaction = account.withdraw(command.amount, command.description);
    await this.accountEventStoreRepository.save(account);
    await this.transactionRepository.save(transaction);
    account.commitEvents();
    return transaction;
  }
}
