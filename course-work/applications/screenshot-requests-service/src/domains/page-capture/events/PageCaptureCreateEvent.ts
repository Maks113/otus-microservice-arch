import { IsNotEmpty, IsString } from 'class-validator';
import { TraceEvent } from '../../../common/TraceEvent';
import { TraceCarrier } from '../../../common/TraceCarrier';

export class PageCaptureCreateEvent extends TraceEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  constructor(requestId: string, link: string, traceCarrier?: TraceCarrier) {
    super(traceCarrier)
    this.requestId = requestId;
    this.link = link;
  }
}