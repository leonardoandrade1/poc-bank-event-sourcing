import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Account } from 'src/bank-account/domain/entities/account.entity';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { FetchAllTransactionsByAccountBranchAndNumberQuery } from 'src/bank-account/domain/queries/transaction/fetch-all-transactions-by-account-branch-and-number.query';
import { TransactionRepository } from 'src/bank-account/infra/repositories/transaction.repository';

@QueryHandler(FetchAllTransactionsByAccountBranchAndNumberQuery)
export class FetchAllTransactionsByAccountBranchAndNumberQueryHandler
  implements IQueryHandler<FetchAllTransactionsByAccountBranchAndNumberQuery>
{
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    query: FetchAllTransactionsByAccountBranchAndNumberQuery,
  ): Promise<Array<Transaction>> {
    const transactions =
      await this.transactionRepository.fetchAllTransactionsFromAggregate(
        Account.GenerateAggregateId(query.accountNumber, query.accountBranch),
      );
    return transactions;
  }
}
