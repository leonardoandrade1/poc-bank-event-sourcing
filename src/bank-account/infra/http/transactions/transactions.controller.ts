import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Account } from 'src/bank-account/domain/entities/account.entity';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { TransactionDTO } from './dto/transaction.dto';

@ApiTags('Transaction')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  @Get('/branch/:accountBranch/account/:accountNumber')
  async fetchAllTransactions(
    @Param('accountBranch') accountBranch: string,
    @Param('accountNumber') accountNumber: string,
    @Res() res: Response,
  ) {
    const transactions =
      await this.transactionRepository.fetchAllTransactionsFromAggregate(
        Account.GenerateAggregateId(accountNumber, accountBranch),
      );

    if (!transactions.length) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    const transactionsDTO = transactions.map((transaction) =>
      TransactionDTO.FromTransaction(transaction),
    );

    return res.status(HttpStatus.OK).json(transactionsDTO);
  }

  @Get(
    '/branch/:accountBranch/account/:accountNumber/transaction/:transactionId',
  )
  async fetchAggregateTransaction(
    @Param('accountBranch') accountBranch: string,
    @Param('accountNumber') accountNumber: string,
    @Param('transactionId') transactionId: string,
  ) {
    const transaction =
      await this.transactionRepository.fetchTransaction(transactionId);
    if (!transaction) throw new NotFoundException('transaction not found');
    const accountAggregate = Account.GenerateAggregateId(
      accountNumber,
      accountBranch,
    );

    if (!transaction.belongsTo(accountAggregate)) {
      throw new BadRequestException(
        'Cannot get transactions that belongs to another account',
      );
    }

    return TransactionDTO.FromTransaction(transaction);
  }
}
