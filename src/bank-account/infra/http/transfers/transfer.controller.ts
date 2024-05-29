import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountEventStoreRepository } from '../../repositories/account-event-store.repository';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionRepository } from '../../repositories/transaction.repository';

@ApiTags('Transfer')
@Controller('transfer')
export class TransferController {
  constructor(
    private readonly accountEventStoreRepository: AccountEventStoreRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @Post()
  async transferMoney(@Body() body: CreateTransferDto) {
    const fromAccount =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        body.sender.branch,
        body.sender.account,
      );
    if (!fromAccount) throw new NotFoundException('Sender account not found');
    const toAccount =
      await this.accountEventStoreRepository.getFromAccountBranchAndNumber(
        body.receiver.branch,
        body.receiver.account,
      );
    if (!toAccount) throw new NotFoundException('Receiver account not found');
    // TODO: init transfer money process and complete it after return of antifraud
    const transaction = fromAccount.withdraw(body.amount, body.description);
    toAccount.deposit(body.amount, body.description, transaction.transactionId);
    await this.accountEventStoreRepository.save(fromAccount);
    await this.accountEventStoreRepository.save(toAccount);
    await this.transactionRepository.save(transaction);
    fromAccount.commitEvents();
    toAccount.commitEvents();
    return {
      transactionId: transaction.transactionId,
    };
  }
}
