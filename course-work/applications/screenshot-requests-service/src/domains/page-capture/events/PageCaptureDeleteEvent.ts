import { IsNotEmpty, IsString } from 'class-validator';

export class PageCaptureDeleteEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  imageName: string;

  constructor(requestId: string, imageName: string) {
    this.requestId = requestId;
    this.imageName = imageName;
  }
}