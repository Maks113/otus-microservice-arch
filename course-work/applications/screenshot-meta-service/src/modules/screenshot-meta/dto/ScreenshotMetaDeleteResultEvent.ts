import { IsNotEmpty, IsString } from 'class-validator';

export class ScreenshotMetaDeleteResultEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }
}