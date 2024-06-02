import { faker } from '@faker-js/faker';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAccountCommand } from 'src/bank-account/domain/commands/account/create-account.command';
import { Account } from 'src/bank-account/domain/entities/account.entity';
import { AccountEventStoreRepository } from 'src/bank-account/infra/repositories/account-event-store.repository';

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
  ) {}
  async execute(command: CreateAccountCommand): Promise<Account> {
    const accountNumber = faker.finance.accountNumber(6);
    const accountBranch = faker.finance.accountNumber(4);
    const account = Account.Create(
      command.documentNumber,
      accountNumber,
      accountBranch,
    );

    await this.accountEventStoreRepository.save(account);
    account.commitEvents();
    // TODO: dispatch event to finish aacount register
    return account;
  }
}
