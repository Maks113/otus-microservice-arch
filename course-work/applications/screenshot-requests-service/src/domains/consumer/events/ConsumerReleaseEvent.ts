import { IsNotEmpty, IsString } from 'class-validator';

export class ConsumerReleaseEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  constructor(requestId: string, email: string) {
    this.email = email;
    this.requestId = requestId;
  }
}