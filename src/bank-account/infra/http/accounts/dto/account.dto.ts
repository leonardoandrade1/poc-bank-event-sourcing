import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/bank-account/domain/entities/account.entity';
import { AccountStatus } from 'src/bank-account/domain/enums/account-status.enum';

export class AccountDTO {
  @ApiProperty({
    example: '0001',
  })
  branch: string;

  @ApiProperty({
    example: '000001',
  })
  account: string;

  @ApiProperty({
    example: 0,
  })
  balance: number;

  @ApiProperty({
    example: '53486705024',
  })
  document: string;

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.IN_ANALYSIS,
  })
  status: AccountStatus;

  public static FromAccount(account: Account): AccountDTO {
    const dto = new AccountDTO();
    dto.branch = account.branch;
    dto.account = account.account;
    dto.document = account.document;
    dto.balance = account.balance;
    dto.status = account.status;
    return dto;
  }
}
