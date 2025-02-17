import { IsNotEmpty, IsString } from 'class-validator';
import { TraceCarrier } from '../../../common/TraceCarrier';
import { TraceEvent } from '../../../common/TraceEvent';

export class ConsumerReleaseResultEvent extends TraceEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  constructor(requestId: string, traceCarrier?: TraceCarrier) {
    super(traceCarrier)
    this.requestId = requestId;
  }
}