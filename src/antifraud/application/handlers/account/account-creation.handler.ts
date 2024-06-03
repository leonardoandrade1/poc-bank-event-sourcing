import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountCreationCommand } from 'src/antifraud/domain/command/account-creation.command';
import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';
import { AntifraudRepository } from 'src/antifraud/infra/repositories/antifraud.repository';

@CommandHandler(AccountCreationCommand)
export class AccountCreationCommandHandler
  implements ICommandHandler<AccountCreationCommand>
{
  constructor(private readonly antifraudRepository: AntifraudRepository) {}

  async execute(command: AccountCreationCommand): Promise<Antifraud> {
    const antifraudId = Antifraud.GenerateAccountCreationId(
      command.documentNumber,
      command.accountBranch,
      command.accountNumber,
    );
    const previousAnalysis =
      await this.antifraudRepository.fetchByAntifraudId(antifraudId);
    if (previousAnalysis) return previousAnalysis;
    const antifraudAnalysis = Antifraud.CreateAccountCreation(
      command.documentNumber,
      command.accountBranch,
      command.accountNumber,
    );
    antifraudAnalysis.runAnalysis();
    await this.antifraudRepository.save(antifraudAnalysis);
    return antifraudAnalysis;
  }
}
