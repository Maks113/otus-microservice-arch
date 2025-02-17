import { IsNotEmpty, IsString } from 'class-validator';
import { TraceEvent } from '../../../common/TraceEvent';
import { TraceCarrier } from '../../../common/TraceCarrier';

export class ScreenshotMetaDeleteResultEvent extends TraceEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  constructor(requestId: string, traceCarrier?: TraceCarrier) {
    super(traceCarrier);
    this.requestId = requestId;
  }
}