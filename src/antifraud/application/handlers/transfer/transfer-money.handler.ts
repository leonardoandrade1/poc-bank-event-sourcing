import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferMoneyCommand } from 'src/antifraud/domain/command/transfer-money.command';
import {
  AnalysisStatus,
  AntifraudType,
} from 'src/antifraud/domain/entities/antifraud.entity';

@CommandHandler(TransferMoneyCommand)
export class TransferMoneyCommandHandler
  implements ICommandHandler<TransferMoneyCommand>
{
  private transferMoneyAnalysisMap: Map<string, any> = new Map();

  async execute(command: TransferMoneyCommand): Promise<any> {
    const alreadyAnalyzed = this.transferMoneyAnalysisMap.get(
      command.transactionId,
    );
    if (alreadyAnalyzed) return alreadyAnalyzed;
    const shouldApprove = parseInt(command.receiver.documentNumber) % 2 === 0;
    const analysis = {
      transaction: command,
      type: AntifraudType.TRANSFER,
      status: shouldApprove ? AnalysisStatus.APPROVED : AnalysisStatus.REPROVED,
      reason: shouldApprove ? '' : 'Reproved by compliance rule',
    };
    this.transferMoneyAnalysisMap.set(command.transactionId, analysis);
    return analysis;
  }
}
