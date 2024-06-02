export class FetchAccountByBranchAndNumberQuery {
  constructor(
    readonly accountBranch: string,
    readonly accountNumber: string,
  ) {}
}
