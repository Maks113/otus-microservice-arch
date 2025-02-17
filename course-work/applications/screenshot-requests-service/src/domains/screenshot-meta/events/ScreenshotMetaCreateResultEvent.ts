import { IsNotEmpty, IsString } from 'class-validator';
import { TraceEvent } from '../../../common/TraceEvent';
import { TraceCarrier } from '../../../common/TraceCarrier';

export class ScreenshotMetaCreateResultEvent extends TraceEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsString()
  error: string | null;

  constructor(requestId: string, error: string | null, traceCarrier?: TraceCarrier) {
    super(traceCarrier);
    this.error = error;
    this.requestId = requestId;
  }

}