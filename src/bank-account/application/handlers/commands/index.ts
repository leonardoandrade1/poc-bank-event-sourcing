import { CreateAccountCommandHandler } from './create-account.handler';
import { TransferMoneyCommandHandler } from './transfer-money.handler';
import { DepositMoneyCommandHandler } from './deposit-money.handler';
import { WithdrawMoneyCommandHandler } from './withdraw-money.handler';
import { DisableAccountCommandHandler } from './disable-account.handler';

export const CommandHandlers = [
  TransferMoneyCommandHandler,
  CreateAccountCommandHandler,
  DepositMoneyCommandHandler,
  WithdrawMoneyCommandHandler,
  DisableAccountCommandHandler,
];
