import { AccountCreationCommandHandler } from './account/account-creation.handler';
import { TransferMoneyCommandHandler } from './transfer/transfer-money.handler';

export const CommandHandlers = [
  AccountCreationCommandHandler,
  TransferMoneyCommandHandler,
];
