import { IsNotEmpty, IsString } from 'class-validator';

export class ConsumerKeepEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}