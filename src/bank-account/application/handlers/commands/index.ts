import { CreateAccountCommandHandler } from './create-account.handler';
import { TransferMoneyCommandHandler } from './transfer-money.handler';
import { DepositMoneyCommandHandler } from './deposit-money.handler';

export const CommandHandlers = [
  TransferMoneyCommandHandler,
  CreateAccountCommandHandler,
  DepositMoneyCommandHandler,
];
