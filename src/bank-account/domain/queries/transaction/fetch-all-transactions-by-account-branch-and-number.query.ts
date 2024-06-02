export class FetchAllTransactionsByAccountBranchAndNumberQuery {
  constructor(
    readonly accountBranch: string,
    readonly accountNumber: string,
  ) {}
}
