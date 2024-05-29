import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferMoneyCommand } from 'src/bank-account/domain/commands/transaction/transfer-money.command';
import { AccountEventStoreRepository } from '../../../infra/repositories/account-event-store.repository';
import { TransactionRepository } from '../../../infra/repositories/transaction.repository';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(TransferMoneyCommand)
export class TransferMoneyCommandHandler
  implements ICommandHandler<TransferMoneyCommand>
{
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(command: TransferMoneyCommand): Promise<Transaction> {
    const fromAccount =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        command.sender.branch,
        command.sender.account,
      );
    if (!fromAccount) throw new NotFoundException('Sender account not found');
    const toAccount =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        command.receiver.branch,
        command.receiver.account,
      );
    if (!toAccount) throw new NotFoundException('Receiver account not found');
    // TODO: init transfer money process and complete it after return of antifraud
    const transaction = fromAccount.withdraw(
      command.amount,
      command.description,
    );
    toAccount.deposit(
      command.amount,
      command.description,
      transaction.transactionId,
    );
    await this.accountEventStoreRepository.save(fromAccount);
    await this.accountEventStoreRepository.save(toAccount);
    await this.transactionRepository.save(transaction);
    fromAccount.commitEvents();
    toAccount.commitEvents();
    return transaction;
  }
}
