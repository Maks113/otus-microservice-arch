import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ConsumerKeepResultEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsString()
  error: string | null;

  constructor(requestId: string, error: string | null) {
    this.requestId = requestId;
    this.error = error;
  }
}