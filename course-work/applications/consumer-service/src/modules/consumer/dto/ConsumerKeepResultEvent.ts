import { IsNotEmpty, IsString } from 'class-validator';
import { TraceCarrier } from '../../../common/TraceCarrier';
import { TraceEvent } from '../../../common/TraceEvent';

export class ConsumerKeepResultEvent extends TraceEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsString()
  error: string | null;

  constructor(requestId: string, error: string | null, traceCarrier?: TraceCarrier) {
    super(traceCarrier)
    this.requestId = requestId;
    this.error = error;
  }
}