import crypto from 'node:crypto';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class Transaction {
  aggregateId: string;
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  description: string;
  created: Date;

  private constructor() {}

  private static GetTransactionId(transactionId?: string): string {
    return transactionId ?? crypto.randomUUID();
  }

  public static Start(
    aggregateId: string,
    amount: number,
    description: string,
  ): Transaction {
    const transaction = new Transaction();
    transaction.aggregateId = aggregateId;
    transaction.transactionId = this.GetTransactionId();
    transaction.status = TransactionStatus.IN_ANALYSIS;
    transaction.amount = amount;
    transaction.description = description;
    transaction.created = new Date();
    return transaction;
  }

  public static StartDeposit(
    aggregateId: string,
    amount: number,
    description: string,
    transactionId?: string,
  ): Transaction {
    const transaction = new Transaction();
    transaction.aggregateId = aggregateId;
    transaction.transactionId = this.GetTransactionId(transactionId);
    transaction.status = TransactionStatus.COMPLETED; // TODO: add async process for deposit
    transaction.amount = amount;
    transaction.description = description;
    transaction.created = new Date();
    return transaction;
  }

  public static StartWithdraw(
    aggregateId: string,
    transactionId: string,
    amount: number,
    description: string,
  ): Transaction {
    const transaction = new Transaction();
    transaction.aggregateId = aggregateId;
    transaction.transactionId = this.GetTransactionId(transactionId);
    transaction.status = TransactionStatus.COMPLETED;
    transaction.amount = amount;
    transaction.description =
      description ?? `Withdraw dated ${new Date().toISOString()}`;
    transaction.created = new Date();
    return transaction;
  }

  public static Restore(
    aggregateId: string,
    transactionId: string,
    status: TransactionStatus,
    amount: number,
    description: string,
    created: Date,
  ): Transaction {
    const transaction = new Transaction();
    transaction.aggregateId = aggregateId;
    transaction.transactionId = this.GetTransactionId(transactionId);
    transaction.status = status;
    transaction.amount = amount;
    transaction.description = description;
    transaction.created = created;
    return transaction;
  }

  belongsTo(accountAggregate: string): boolean {
    return this.aggregateId === accountAggregate;
  }
}
