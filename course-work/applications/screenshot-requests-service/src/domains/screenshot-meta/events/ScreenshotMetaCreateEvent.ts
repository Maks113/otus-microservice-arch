import { IsNotEmpty, IsString } from 'class-validator';

export class ScreenshotMetaCreateEvent {
  @IsNotEmpty()
  @IsString()
  hash: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  filename: string;

  constructor(requestId: string, link: string, hash: string, fileName: string) {
    this.link = link;
    this.requestId = requestId;
    this.hash = hash;
    this.filename = fileName;
  }
}