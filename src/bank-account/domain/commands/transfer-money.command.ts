export class TransferMoneyCommand {
  amount: number;
  description: string;
  sender: TransferMoneyCommand.AccountHolder;
  receiver: TransferMoneyCommand.AccountHolder;
  constructor(params: TransferMoneyCommand.Params) {
    this.amount = params.amount;
    this.description = params.description;
    this.sender = params.sender;
    this.receiver = params.receiver;
  }
}

export namespace TransferMoneyCommand {
  export type AccountHolder = {
    documentNumber: string;
    branch: string;
    account: string;
  };
  export type Params = {
    amount: number;
    description: string;
    sender: AccountHolder;
    receiver: AccountHolder;
  };
}
