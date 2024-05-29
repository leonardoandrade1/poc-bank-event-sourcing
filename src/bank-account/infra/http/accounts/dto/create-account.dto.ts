import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: '53486705024',
  })
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  documentNumber: string;
}
