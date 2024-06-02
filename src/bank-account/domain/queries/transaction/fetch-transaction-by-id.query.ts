export class FetchTransactionByIdQuery {
  constructor(
    readonly accountBranch: string,
    readonly accountNumber: string,
    readonly transactionId: string,
  ) {}
}
