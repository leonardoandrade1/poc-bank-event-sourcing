import { CreateAccountCommandHandler } from './create-account.handler';
import { TransferMoneyCommandHandler } from './transfer-money.handler';

export const CommandHandlers = [
  TransferMoneyCommandHandler,
  CreateAccountCommandHandler,
];
