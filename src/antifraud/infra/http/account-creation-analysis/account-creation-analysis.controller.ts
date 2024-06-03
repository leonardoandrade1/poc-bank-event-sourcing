import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountCreationDTO } from './dto/account-creation.dto';

@ApiTags('Antifraud')
@Controller('account-creation-analysis')
export class AntifraudAccountCreationAnalysisController {
  private accountAnalysisMap: Map<string, object> = new Map();

  constructor() {}

  @Post()
  async accountCreation(@Body() body: AccountCreationDTO) {
    const previousAnalysis = this.accountAnalysisMap.get(body.documentNumber);
    if (previousAnalysis) return previousAnalysis;

    let status = 'Approved';
    let reason = '';
    const shouldApprove = parseInt(body.documentNumber) % 2 === 0;
    if (!shouldApprove) {
      status = 'Reproved';
      reason = 'Reproved by compliance rules';
    }
    const result = {
      accountNumber: body.accountNumber,
      accountBranch: body.accountBranch,
      documentNumber: body.documentNumber,
      analyzedAt: new Date().toISOString(),
      status,
      reason,
    };
    this.accountAnalysisMap.set(body.documentNumber, result);
    return result;
  }
}
