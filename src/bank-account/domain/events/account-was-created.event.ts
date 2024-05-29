import { AccountStatus } from '../enums/account-status.enum';
import { BaseEvent } from '../../common/domain/base.event';

type AccountWasCreateState = {
  documentNumber: string;
  number: string;
  branch: string;
  status: AccountStatus.IN_ANALYSIS;
  balance: number;
};
export class AccountWasCreated extends BaseEvent<AccountWasCreateState> {
  static EventName = 'ACCOUNT_WAS_CREATED';
  eventName = AccountWasCreated.EventName;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    documentNumber: string,
    number: string,
    branch: string,
  ) {
    const state: AccountWasCreateState = {
      documentNumber,
      number,
      branch,
      status: AccountStatus.IN_ANALYSIS,
      balance: 0,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
