import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
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

export class CreateTransferDto {
  @ApiProperty({
    example: 10.1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: `Transfer to account XYZ buying car Y. dated ${new Date().toISOString()}`,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @ValidateNested()
  sender: AccountHolder;

  @ApiProperty()
  @ValidateNested()
  receiver: AccountHolder;
}
