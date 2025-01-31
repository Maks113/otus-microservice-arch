import { IsNotEmpty, IsString } from 'class-validator';

export class PageCaptureCreateResultEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  @IsString()
  hash: string | null;

  @IsString()
  imageName: string | null;

  @IsNotEmpty()
  @IsString()
  status: 'created' | 'failed';

  @IsString()
  error: string | null;

  constructor(requestId: string, link: string, hash: string | null, imageName: string | null, status: 'created' | 'failed', error = null) {
    this.requestId = requestId;
    this.link = link;
    this.hash = hash;
    this.imageName = imageName;
    this.status = status;
    this.error = error;
  }
}