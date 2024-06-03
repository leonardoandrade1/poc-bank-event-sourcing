import { ApiProperty } from '@nestjs/swagger';

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
