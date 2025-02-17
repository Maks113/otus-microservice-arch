import { api } from '@opentelemetry/sdk-node';
import { IsString } from 'class-validator';
import { TraceCarrier } from './TraceCarrier';

export class TraceEvent  {
  @IsString()
  traceCarrier?: TraceCarrier;

  constructor(traceCarrier?: TraceCarrier) {
    if (traceCarrier) {
      this.traceCarrier = traceCarrier;
    } else {
      this.traceCarrier = {};
      api.propagation.inject(api.context.active(), this.traceCarrier)
    }
  }

  public static getEventContext(traceCarrier?: TraceCarrier) {
    return api.propagation.extract(api.context.active(), traceCarrier);
  }
}