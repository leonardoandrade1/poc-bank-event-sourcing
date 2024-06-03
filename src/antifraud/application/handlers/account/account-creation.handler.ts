import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountCreationCommand } from 'src/antifraud/domain/command/account-creation.command';

@CommandHandler(AccountCreationCommand)
export class AccountCreationCommandHandler
  implements ICommandHandler<AccountCreationCommand>
{
  private accountAnalysisMap: Map<string, object> = new Map();

  async execute(command: AccountCreationCommand): Promise<any> {
    const previousAnalysis = this.accountAnalysisMap.get(
      command.documentNumber,
    );
    if (previousAnalysis) return previousAnalysis;

    let status = 'Approved';
    let reason = '';
    const shouldApprove = parseInt(command.documentNumber) % 2 === 0;
    if (!shouldApprove) {
      status = 'Reproved';
      reason = 'Reproved by compliance rules';
    }
    const result = {
      accountNumber: command.accountNumber,
      accountBranch: command.accountBranch,
      documentNumber: command.documentNumber,
      analyzedAt: new Date().toISOString(),
      status,
      reason,
    };
    this.accountAnalysisMap.set(command.documentNumber, result);
    return result;
  }
}
