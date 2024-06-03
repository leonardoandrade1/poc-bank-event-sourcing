import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountCreationCommand } from 'src/antifraud/domain/command/account-creation.command';
import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';

@CommandHandler(AccountCreationCommand)
export class AccountCreationCommandHandler
  implements ICommandHandler<AccountCreationCommand>
{
  private accountAnalysisMap: Map<string, Antifraud> = new Map();

  async execute(command: AccountCreationCommand): Promise<Antifraud> {
    const previousAnalysis = this.accountAnalysisMap.get(
      command.documentNumber,
    );
    if (previousAnalysis) return previousAnalysis;
    const antifraudAnalysis = Antifraud.CreateAccountCreation(
      command.documentNumber,
      command.accountBranch,
      command.accountNumber,
    );
    antifraudAnalysis.runAnalysis();
    this.accountAnalysisMap.set(command.documentNumber, antifraudAnalysis);
    return antifraudAnalysis;
  }
}
