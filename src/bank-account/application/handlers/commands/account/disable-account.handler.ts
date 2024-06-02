import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DisableAccountCommand } from 'src/bank-account/domain/commands/account/disable-account.command';
import { AccountEventStoreRepository } from 'src/bank-account/infra/repositories/account-event-store.repository';

@CommandHandler(DisableAccountCommand)
export class DisableAccountCommandHandler
  implements ICommandHandler<DisableAccountCommand>
{
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
  ) {}
  async execute(command: DisableAccountCommand): Promise<void> {
    const account =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        command.branch,
        command.account,
      );
    if (!account) throw new NotFoundException('Account not found');
    account.disable();
    await this.accountEventStoreRepository.save(account);
    account.commitEvents();
    return;
  }
}
