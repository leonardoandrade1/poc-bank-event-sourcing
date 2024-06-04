import { Transaction } from '../entities/transaction.entity';
import { BaseEvent } from '../../../common/domain/base.event';

type TransferWasApprovedState = {
  transaction: Transaction;
};
export class TransferWasApproved extends BaseEvent<TransferWasApprovedState> {
  static EventName = 'TRANSFER_WAS_APPROVED';
  eventName = TransferWasApproved.EventName;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    transaction: Transaction,
  ) {
    const state: TransferWasApprovedState = {
      transaction,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
