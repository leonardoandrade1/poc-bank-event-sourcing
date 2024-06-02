import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Account } from 'src/bank-account/domain/entities/account.entity';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { FetchTransactionByIdQuery } from 'src/bank-account/domain/queries/transaction/fetch-transaction-by-id.query';
import { TransactionRepository } from 'src/bank-account/infra/repositories/transaction.repository';

@QueryHandler(FetchTransactionByIdQuery)
export class FetchTransactionByIdQueryHandler
  implements IQueryHandler<FetchTransactionByIdQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(query: FetchTransactionByIdQuery): Promise<Transaction> {
    const transaction = await this.transactionRepository.fetchTransaction(
      query.transactionId,
    );
    if (!transaction) throw new NotFoundException('transaction not found');
    const accountAggregate = Account.GenerateAggregateId(
      query.accountNumber,
      query.accountBranch,
    );
    if (!transaction.belongsTo(accountAggregate)) {
      throw new BadRequestException(
        'Cannot get transactions that belongs to another account',
      );
    }
    return transaction;
  }
}
