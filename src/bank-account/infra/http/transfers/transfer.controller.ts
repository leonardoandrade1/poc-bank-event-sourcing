import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { TransferMoneyCommand } from 'src/bank-account/domain/commands/transfer-money.command';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';

@ApiTags('Transfer')
@Controller('transfer')
export class TransferController {
  constructor(private readonly commandBus: CommandBus) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post()
  async transferMoney(@Body() body: CreateTransferDto) {
    const transaction = await this.commandBus.execute<
      TransferMoneyCommand,
      Transaction
    >(
      new TransferMoneyCommand({
        description: body.description,
        amount: body.amount,
        sender: {
          account: body.sender.account,
          branch: body.sender.branch,
          documentNumber: body.sender.documentNumber,
        },
        receiver: {
          account: body.receiver.account,
          branch: body.receiver.branch,
          documentNumber: body.receiver.documentNumber,
        },
      }),
    );
    return {
      transactionId: transaction.transactionId,
    };
  }
}
