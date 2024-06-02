import { CreateAccountCommandHandler } from './account/create-account.handler';
import { TransferMoneyCommandHandler } from './transaction/transfer-money.handler';
import { DepositMoneyCommandHandler } from './transaction/deposit-money.handler';
import { WithdrawMoneyCommandHandler } from './transaction/withdraw-money.handler';
import { DisableAccountCommandHandler } from './account/disable-account.handler';

export const CommandHandlers = [
  TransferMoneyCommandHandler,
  CreateAccountCommandHandler,
  DepositMoneyCommandHandler,
  WithdrawMoneyCommandHandler,
  DisableAccountCommandHandler,
];
