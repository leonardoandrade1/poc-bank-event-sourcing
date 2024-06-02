import { FetchAccountByBranchAndNumberHandler } from './account/fetch-account-by-branch-and-number.handler';
import { FetchAllTransactionsByAccountBranchAndNumberQueryHandler } from './transaction/fetch-all-transactions-by-account-branch-and-number.handler';
import { FetchTransactionByIdQueryHandler } from './transaction/fetch-transaction-by-id.handler';

export const QueryHandlers = [
  FetchAccountByBranchAndNumberHandler,
  FetchAllTransactionsByAccountBranchAndNumberQueryHandler,
  FetchTransactionByIdQueryHandler,
];
