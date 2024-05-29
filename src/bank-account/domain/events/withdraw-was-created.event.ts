import { Transaction } from '../entities/transaction.entity';
import { BaseEvent } from './base.event';

type WithdrawWasCreateState = {
  transaction: Transaction;
};
export class WithdrawWasCreated extends BaseEvent<WithdrawWasCreateState> {
  static EventName = 'WITHDRAW_WAS_CREATED';
  eventName = WithdrawWasCreated.EventName;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    transaction: Transaction,
  ) {
    const state: WithdrawWasCreateState = {
      transaction,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
