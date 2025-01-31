import { IsNotEmpty, IsString } from 'class-validator';

export class ScreenshotMetaDeleteEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  constructor(requestId: string, link: string) {
    this.link = link;
    this.requestId = requestId;
  }
}