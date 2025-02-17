import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { TraceCarrier } from '../../common/TraceCarrier';
import { Outbox, OutboxDocument } from './schemas/outbox';

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
  ) {}

  public async emit(
    topic: string,
    payload: string,
    traceCarrier?: TraceCarrier,
    session?: ClientSession,
  ): Promise<OutboxDocument[]> {
    return await this.outboxModel.create([{
      topic,
      payload,
      traceCarrier,
    }], { session });
  }
}
