import { IsNotEmpty, IsString } from 'class-validator';

export class ConsumerReleaseEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}