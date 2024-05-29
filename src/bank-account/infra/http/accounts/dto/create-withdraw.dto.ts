import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateWithdrawDto {
  @ApiProperty({
    example: 10.1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: `Withdraw from ATM XYZ dated ${new Date().toISOString()}`,
  })
  @IsString()
  @IsOptional()
  @IsEmpty()
  description?: string;
}
