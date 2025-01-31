import { IsNotEmpty, IsString } from 'class-validator';

export class ScreenshotMetaCreateResultEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsString()
  error: string | null;

  constructor(requestId: string, error: string | null) {
    this.error = error;
    this.requestId = requestId;
  }

}