import { Transaction } from '../entities/transaction.entity';
import { BaseEvent } from '../../../common/domain/base.event';

type TransferWasDepositState = {
  transaction: Transaction;
};
export class TransferWasDeposited extends BaseEvent<TransferWasDepositState> {
  static EventName = 'TRANSFER_WAS_DEPOSITED';
  eventName = TransferWasDeposited.EventName;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    transaction: Transaction,
  ) {
    const state: TransferWasDepositState = {
      transaction,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
