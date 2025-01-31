import { IsNotEmpty, IsString } from 'class-validator';

export class PageCaptureDeleteResultEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }
}