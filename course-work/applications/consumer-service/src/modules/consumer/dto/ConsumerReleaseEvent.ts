import { IsNotEmpty, IsString } from 'class-validator';
import { TraceCarrier } from '../../../common/TraceCarrier';
import { TraceEvent } from '../../../common/TraceEvent';

export class ConsumerReleaseEvent extends TraceEvent {
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  constructor(requestId: string, email: string, traceCarrier?: TraceCarrier) {
    super(traceCarrier);
    this.email = email;
    this.requestId = requestId;
  }
}