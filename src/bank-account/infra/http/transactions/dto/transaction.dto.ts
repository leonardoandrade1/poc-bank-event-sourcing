import crypto from 'node:crypto';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from 'src/bank-account/domain/enums/transaction-status.enum';
import { Transaction } from 'src/bank-account/domain/entities/transaction.entity';

export class TransactionDTO {
  @ApiProperty({
    example: crypto.randomUUID(),
  })
  transactionId: string;

  @ApiProperty({
    example: 0,
  })
  amount: number;

  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.IN_ANALYSIS,
  })
  status: TransactionStatus;

  @ApiProperty({
    example: `Deposit from ATM XYZ dated ${new Date().toISOString()}`,
  })
  description: string;

  @ApiProperty({
    example: `${new Date().toISOString()}`,
  })
  created: string;

  public static FromTransaction(transaction: Transaction): TransactionDTO {
    const dto = new TransactionDTO();
    dto.transactionId = transaction.transactionId;
    dto.amount = transaction.amount;
    dto.status = transaction.status;
    dto.description = transaction.description;
    dto.created = transaction.created.toISOString();
    return dto;
  }
}
