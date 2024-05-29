import { Transaction } from '../entities/transaction.entity';
import { BaseEvent } from './base.event';

type DepositWasCreateState = {
  transaction: Transaction;
};
export class DepositWasCreated extends BaseEvent<DepositWasCreateState> {
  static EventName = 'DEPOSIT_WAS_CREATED';
  eventName = DepositWasCreated.EventName;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    transaction: Transaction,
  ) {
    const state: DepositWasCreateState = {
      transaction,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
