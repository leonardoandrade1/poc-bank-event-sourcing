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
export class TransactionEntity {
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

  static CreateFromModel(model: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.transactionId = model.transactionId;
    entity.aggregateId = model.aggregateId;
    entity.status = model.status;
    entity.amount = model.amount;
    entity.created = model.created;
    entity.description = model.description;
    return entity;
  }
}
