import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestCreateBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  link: string;
}

export class RequestCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userEmail: string;
}
