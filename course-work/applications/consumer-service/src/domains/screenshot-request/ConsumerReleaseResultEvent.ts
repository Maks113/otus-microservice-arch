import { IsNotEmpty, IsString } from 'class-validator';

export class ConsumerReleaseResultEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }
}