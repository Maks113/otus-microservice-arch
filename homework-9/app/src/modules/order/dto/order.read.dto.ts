import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderReadDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
