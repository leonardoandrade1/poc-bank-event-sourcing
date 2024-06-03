import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';
import { TransactionStatus } from 'src/bank-account/domain/enums/transaction-status.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

@Entity()
export class TransactionModel {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  transactionId: string;

  @Column()
  aggregateId: string;

  @Column()
  status: TransactionStatus;

  @Column({ type: 'decimal', transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column()
  created: Date;

  @Column()
  description: string;

  static CreateFromEntity(entity: Transaction): TransactionModel {
    const model = new TransactionModel();
    model.transactionId = entity.transactionId;
    model.aggregateId = entity.aggregateId;
    model.status = entity.status;
    model.amount = entity.amount;
    model.created = entity.created;
    model.description = entity.description;
    return model;
  }
}
