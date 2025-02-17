import { IsNotEmpty, IsString } from 'class-validator';
import { TraceEvent } from '../../../common/TraceEvent';
import { TraceCarrier } from '../../../common/TraceCarrier';

export class ScreenshotMetaCreateEvent extends TraceEvent {
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

  constructor(requestId: string, link: string, hash: string, fileName: string, traceCarrier?: TraceCarrier) {
    super(traceCarrier);
    this.link = link;
    this.requestId = requestId;
    this.hash = hash;
    this.filename = fileName;
  }
}