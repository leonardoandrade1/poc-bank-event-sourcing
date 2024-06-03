import { ApiProperty } from '@nestjs/swagger';
import {
  AnalysisStatus,
  Antifraud,
  AntifraudType,
} from 'src/antifraud/domain/entities/antifraud.entity';

export class AntifraudAccountAnalysisDTO {
  @ApiProperty({
    example: '0001',
  })
  accountBranch: string;

  @ApiProperty({
    example: '000001',
  })
  accountNumber: string;

  @ApiProperty({
    example: '53486705024',
  })
  documentNumber: string;

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
  ): AntifraudAccountAnalysisDTO {
    const dto = new AntifraudAccountAnalysisDTO();
    dto.accountBranch = antifraud.payload.accountBranch;
    dto.accountNumber = antifraud.payload.accountNumber;
    dto.documentNumber = antifraud.payload.documentNumber;
    dto.analysisType = antifraud.type;
    dto.status = antifraud.status;
    dto.reason = antifraud.reason;
    dto.analyzedAt = antifraud.analyzedAt.toISOString();
    return dto;
  }
}
