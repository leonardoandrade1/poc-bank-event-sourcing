import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FetchAllTransactionsByAccountBranchAndNumberQuery } from 'src/bank-account/domain/queries/transaction/fetch-all-transactions-by-account-branch-and-number.query';
import { FetchTransactionByIdQuery } from 'src/bank-account/domain/queries/transaction/fetch-transaction-by-id.query';
import { TransactionDTO } from './dto/transaction.dto';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';

@ApiTags('Transaction')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/branch/:accountBranch/account/:accountNumber')
  async fetchAllTransactions(
    @Param('accountBranch') accountBranch: string,
    @Param('accountNumber') accountNumber: string,
    @Res() res: Response,
  ) {
    const transactions = await this.queryBus.execute<
      FetchAllTransactionsByAccountBranchAndNumberQuery,
      Array<Transaction>
    >(
      new FetchAllTransactionsByAccountBranchAndNumberQuery(
        accountBranch,
        accountNumber,
      ),
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
    const transaction = await this.queryBus.execute<
      FetchAllTransactionsByAccountBranchAndNumberQuery,
      Transaction
    >(
      new FetchTransactionByIdQuery(
        accountBranch,
        accountNumber,
        transactionId,
      ),
    );

    return TransactionDTO.FromTransaction(transaction);
  }
}
