import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionModel } from './typeorm/models/transaction.model';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(TransactionModel)
    private readonly transactionRepository: Repository<TransactionModel>,
  ) {}

  async save(transaction: Transaction): Promise<void> {
    const model = TransactionModel.CreateFromEntity(transaction);
    await this.transactionRepository.save(model);
  }

  async fetchAllTransactionsFromAggregate(
    aggregateId: string,
  ): Promise<Array<Transaction>> {
    const modelTransactions = await this.transactionRepository.find({
      where: {
        aggregateId,
      },
    });

    return modelTransactions.map((model) =>
      Transaction.Restore(
        model.aggregateId,
        model.transactionId,
        model.status,
        model.amount,
        model.description,
        model.created,
      ),
    );
  }

  async fetchTransaction(transactionId: string): Promise<Transaction> {
    const modelTransaction = await this.transactionRepository.findOne({
      where: {
        transactionId,
      },
    });

    if (!modelTransaction) return undefined;
    return Transaction.Restore(
      modelTransaction.aggregateId,
      modelTransaction.transactionId,
      modelTransaction.status,
      modelTransaction.amount,
      modelTransaction.description,
      modelTransaction.created,
    );
  }

  async fetchTransactionFromAggregateAndTransactionId(
    aggregateId: string,
    transactionId: string,
  ): Promise<Transaction> {
    const modelTransaction = await this.transactionRepository.findOne({
      where: {
        aggregateId,
        transactionId,
      },
    });

    if (!modelTransaction) return undefined;
    return Transaction.Restore(
      modelTransaction.aggregateId,
      modelTransaction.transactionId,
      modelTransaction.status,
      modelTransaction.amount,
      modelTransaction.description,
      modelTransaction.created,
    );
  }
}
