import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferMoneyCommand } from 'src/antifraud/domain/command/transfer-money.command';
import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';
import { AntifraudRepository } from 'src/antifraud/infra/repositories/antifraud.repository';

@CommandHandler(TransferMoneyCommand)
export class TransferMoneyCommandHandler
  implements ICommandHandler<TransferMoneyCommand>
{
  constructor(private readonly antifraudRepository: AntifraudRepository) {}

  async execute(command: TransferMoneyCommand): Promise<Antifraud> {
    const antifraudId = Antifraud.GenerateTransferMoneyId(
      command.transactionId,
    );
    const alreadyAnalyzed =
      await this.antifraudRepository.fetchByAntifraudId(antifraudId);
    if (alreadyAnalyzed) return alreadyAnalyzed;
    const antifraudAnalysis = Antifraud.CreateTransferMoney(
      command.transactionId,
      command.amount,
      command.sender,
      command.receiver,
    );
    antifraudAnalysis.runAnalysis();
    await this.antifraudRepository.save(antifraudAnalysis);
    return antifraudAnalysis;
  }
}
