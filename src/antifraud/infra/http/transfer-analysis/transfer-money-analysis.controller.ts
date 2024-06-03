import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AnalysisStatus,
  AntifraudType,
} from 'src/antifraud/domain/entities/antifraud.entity';
import { TransferMoneyDTO } from './dto/transfer-money.dto';

@ApiTags('Antifraud')
@Controller('transfer-analysis')
export class AntifraudTransferAnalysisController {
  private transferMoneyAnalysisMap: Map<string, any> = new Map();
  constructor() {}

  @Post()
  async transferMoney(@Body() body: TransferMoneyDTO) {
    const alreadyAnalyzed = this.transferMoneyAnalysisMap.get(
      body.transactionId,
    );
    if (alreadyAnalyzed) return alreadyAnalyzed;
    const shouldApprove = parseInt(body.receiver.documentNumber) % 2 === 0;
    const analysis = {
      transaction: body,
      type: AntifraudType.TRANSFER,
      status: shouldApprove ? AnalysisStatus.APPROVED : AnalysisStatus.REPROVED,
      reason: shouldApprove ? '' : 'Reproved by compliance rule',
    };
    this.transferMoneyAnalysisMap.set(body.transactionId, analysis);
    return analysis;
  }
}
