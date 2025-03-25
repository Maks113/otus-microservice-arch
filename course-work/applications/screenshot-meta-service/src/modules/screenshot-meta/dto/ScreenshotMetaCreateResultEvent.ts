import { IsNotEmpty, IsString } from 'class-validator';

export class ScreenshotMetaCreateResultEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsString()
  metaId: string | null;

  @IsString()
  error: string | null;

  constructor(requestId: string, metaId: string | null, error: string | null) {
    this.error = error;
    this.metaId = metaId;
    this.requestId = requestId;
  }

}