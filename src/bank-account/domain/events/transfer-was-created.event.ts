import { Transaction } from '../entities/transaction.entity';
import { BaseEvent } from '../../../common/domain/base.event';

type TransferWasCreateState = {
  transaction: Transaction;
};
export class TransferWasCreated extends BaseEvent<TransferWasCreateState> {
  static EventName = 'TRANSFER_WAS_CREATED';
  eventName = TransferWasCreated.EventName;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    transaction: Transaction,
  ) {
    const state: TransferWasCreateState = {
      transaction,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
