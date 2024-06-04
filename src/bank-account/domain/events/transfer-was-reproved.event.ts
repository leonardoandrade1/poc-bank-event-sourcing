import { Transaction } from '../entities/transaction.entity';
import { BaseEvent } from '../../../common/domain/base.event';

type TransferWasReproveState = {
  transaction: Transaction;
};
export class TransferWasReproved extends BaseEvent<TransferWasReproveState> {
  static EventName = 'TRANSFER_WAS_REPROVED';
  eventName = TransferWasReproved.EventName;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    transaction: Transaction,
  ) {
    const state: TransferWasReproveState = {
      transaction,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
