import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccountUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  value: number;
}
