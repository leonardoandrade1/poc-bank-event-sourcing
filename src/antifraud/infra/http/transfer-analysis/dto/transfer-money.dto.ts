import crypto from 'node:crypto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AccountHolder {
  @ApiProperty({
    example: '53486705024',
  })
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  documentNumber: string;

  @ApiProperty({
    example: '0001',
  })
  branch: string;

  @ApiProperty({
    example: '000001',
  })
  account: string;
}

export class TransferMoneyDTO {
  @ApiProperty({
    example: crypto.randomUUID(),
  })
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @ApiProperty({
    example: 10.1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ValidateNested()
  sender: AccountHolder;

  @ValidateNested()
  receiver: AccountHolder;
}
