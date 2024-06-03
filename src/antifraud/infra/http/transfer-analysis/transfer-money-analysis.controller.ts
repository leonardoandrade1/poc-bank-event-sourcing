import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { TransferMoneyCommand } from 'src/antifraud/domain/command/transfer-money.command';
import { TransferMoneyDTO } from './dto/transfer-money.dto';

@ApiTags('Antifraud')
@Controller('transfer-analysis')
export class AntifraudTransferAnalysisController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async transferMoney(@Body() body: TransferMoneyDTO) {
    const analysis = await this.commandBus.execute(
      new TransferMoneyCommand({
        transactionId: body.transactionId,
        amount: body.amount,
        sender: {
          documentNumber: body.sender.documentNumber,
          accountBranch: body.sender.branch,
          accountNumber: body.sender.account,
        },
        receiver: {
          documentNumber: body.receiver.documentNumber,
          accountBranch: body.receiver.branch,
          accountNumber: body.receiver.account,
        },
      }),
    );
    return analysis;
  }
}
