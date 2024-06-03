import crypto from 'node:crypto';
import { ApiProperty } from '@nestjs/swagger';
import { Antifraud } from 'src/antifraud/domain/entities/antifraud.entity';
import { AccountHolder } from './transfer-money.dto';
import { AnalysisStatus, AntifraudType } from 'src/antifraud/domain/enums';

export class AntifraudTransaction {
  @ApiProperty({
    example: crypto.randomUUID(),
  })
  transactionId: string;

  @ApiProperty({
    example: 10.1,
  })
  amount: number;

  @ApiProperty()
  sender: AccountHolder;

  @ApiProperty()
  receiver: AccountHolder;
}

export class AntifraudTransferMoneyAnalysisDTO {
  @ApiProperty()
  transaction: AntifraudTransaction;

  @ApiProperty({
    enum: AntifraudType,
    example: AntifraudType.ACCOUNT,
  })
  analysisType: AntifraudType;

  @ApiProperty({
    enum: AnalysisStatus,
    example: AnalysisStatus.APPROVED,
  })
  status: AnalysisStatus;

  @ApiProperty({
    example: 'Reproved by XYZ rule',
    nullable: true,
    required: false,
  })
  reason: string;

  @ApiProperty({
    example: new Date().toISOString(),
  })
  analyzedAt: string;

  public static FromAntifraud(
    antifraud: Antifraud,
  ): AntifraudTransferMoneyAnalysisDTO {
    const dto = new AntifraudTransferMoneyAnalysisDTO();
    dto.transaction = {
      transactionId: antifraud.payload.transactionId,
      amount: antifraud.payload.amount,
      sender: {
        documentNumber: antifraud.payload.sender.documentNumber,
        account: antifraud.payload.sender.accountNumber,
        branch: antifraud.payload.sender.accountBranch,
      },
      receiver: {
        documentNumber: antifraud.payload.receiver.documentNumber,
        account: antifraud.payload.receiver.accountNumber,
        branch: antifraud.payload.receiver.accountBranch,
      },
    };
    dto.analysisType = antifraud.type;
    dto.status = antifraud.status;
    dto.reason = antifraud.reason;
    dto.analyzedAt = antifraud.analyzedAt.toISOString();
    return dto;
  }
}
