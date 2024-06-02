import { FetchAccountByBranchAndNumberHandler } from './fetch-account-by-branch-and-number.handler';
import { FetchAllTransactionsByAccountBranchAndNumberQueryHandler } from './fetch-all-transactions-by-account-branch-and-number.handler';

export const QueryHandlers = [
  FetchAccountByBranchAndNumberHandler,
  FetchAllTransactionsByAccountBranchAndNumberQueryHandler,
];
