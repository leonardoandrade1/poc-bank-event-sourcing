import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Antifraud')
@Controller('account-creation-analysis')
export class AntifraudAccountCreationAnalysisController {
  constructor() {}

  @Post()
  async accountCreation(@Body() body: any) {
    let status = 'Approved';
    let reason = '';
    const shouldApprove = parseInt(body.documentNumber) % 2 === 0;
    if (!shouldApprove) {
      status = 'Reproved';
      reason = 'Reproved by compliance rules';
    }
    return {
      accountNumber: body.accountNumber,
      accountBranch: body.accountBranch,
      documentNumber: body.documentNumber,
      analyzedAt: new Date().toISOString(),
      status,
      reason,
    };
  }
}
