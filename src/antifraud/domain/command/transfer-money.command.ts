import { AccountHolder } from '../value-objects/account-holder.value-object';

export class TransferMoneyCommand {
  readonly transactionId: string;
  readonly amount: number;
  readonly sender: AccountHolder;
  readonly receiver: AccountHolder;

  constructor(params: TransferMoneyCommand.Params) {
    this.transactionId = params.transactionId;
    this.amount = params.amount;
    this.sender = params.sender;
    this.receiver = params.receiver;
  }
}

export namespace TransferMoneyCommand {
  export type Params = {
    transactionId: string;
    amount: number;
    sender: AccountHolder;
    receiver: AccountHolder;
  };
}
