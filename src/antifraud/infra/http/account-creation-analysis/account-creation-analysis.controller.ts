import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

export class AccountCreationDTO {
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
}

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
