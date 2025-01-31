import { IsNotEmpty, IsString } from 'class-validator';

export class PageCaptureCreateEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  constructor(requestId: string, link: string) {
    this.requestId = requestId;
    this.link = link;
  }
}