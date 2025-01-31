import { IsNotEmpty, IsString } from 'class-validator';

export class PageCaptureDeleteEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  imageName: string;
}