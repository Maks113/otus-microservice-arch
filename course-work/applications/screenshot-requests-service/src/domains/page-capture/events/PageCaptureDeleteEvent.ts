import { IsNotEmpty, IsString } from 'class-validator';
import { TraceEvent } from '../../../common/TraceEvent';
import { TraceCarrier } from '../../../common/TraceCarrier';

export class PageCaptureDeleteEvent extends TraceEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  imageName: string;

  constructor(requestId: string, imageName: string, traceCarrier?: TraceCarrier) {
    super(traceCarrier)
    this.requestId = requestId;
    this.imageName = imageName;
  }
}