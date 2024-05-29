import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({
    example: 10.1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: `Deposit from ATM XYZ dated ${new Date().toISOString()}`,
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
