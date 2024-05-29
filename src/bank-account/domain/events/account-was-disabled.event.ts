import { AccountStatus } from '../enums/account-status.enum';
import { BaseEvent } from '../../common/domain/base.event';

type AccountWasDisableState = {
  status: AccountStatus;
};
export class AccountWasDisabled extends BaseEvent<AccountWasDisableState> {
  static EventName = 'ACCOUNT_WAS_CREATED';
  eventName = AccountWasDisabled.EventName;

  constructor(aggregateId: string, aggregateVersion: number) {
    const state: AccountWasDisableState = {
      status: AccountStatus.DISABLED,
    };
    super(aggregateId, aggregateVersion, state);
  }
}
