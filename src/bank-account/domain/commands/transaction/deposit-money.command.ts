export class DepositMoneyCommand {
  readonly documentNumber: string;
  readonly account: string;
  readonly branch: string;
  readonly amount: number;
  readonly description: string;

  constructor(params: DepositMoneyCommand.Params) {
    this.documentNumber = params.documentNumber;
    this.account = params.account;
    this.branch = params.branch;
    this.amount = params.amount;
    this.description = params.description;
  }
}

export namespace DepositMoneyCommand {
  export type Params = {
    documentNumber: string;
    account: string;
    branch: string;
    amount: number;
    description: string;
  };
}
