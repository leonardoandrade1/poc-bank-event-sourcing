import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionEntity } from './typeorm/entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async save(transaction: Transaction): Promise<void> {
    const entity = TransactionEntity.CreateFromModel(transaction);
    await this.transactionRepository.save(entity);
  }

  async fetchAllTransactionsFromAggregate(
    aggregateId: string,
  ): Promise<Array<Transaction>> {
    const entityTransactions = await this.transactionRepository.find({
      where: {
        aggregateId,
      },
    });

    return entityTransactions.map((entity) =>
      Transaction.Restore(
        entity.aggregateId,
        entity.transactionId,
        entity.status,
        entity.amount,
        entity.description,
        entity.created,
      ),
    );
  }

  async fetchTransaction(transactionId: string): Promise<Transaction> {
    const entityTransaction = await this.transactionRepository.findOne({
      where: {
        transactionId,
      },
    });

    if (!entityTransaction) return undefined;
    return Transaction.Restore(
      entityTransaction.aggregateId,
      entityTransaction.transactionId,
      entityTransaction.status,
      entityTransaction.amount,
      entityTransaction.description,
      entityTransaction.created,
    );
  }

  async fetchTransactionFromAggregateAndTransactionId(
    aggregateId: string,
    transactionId: string,
  ): Promise<Transaction> {
    const entityTransaction = await this.transactionRepository.findOne({
      where: {
        aggregateId,
        transactionId,
      },
    });

    if (!entityTransaction) return undefined;
    return Transaction.Restore(
      entityTransaction.aggregateId,
      entityTransaction.transactionId,
      entityTransaction.status,
      entityTransaction.amount,
      entityTransaction.description,
      entityTransaction.created,
    );
  }
}
