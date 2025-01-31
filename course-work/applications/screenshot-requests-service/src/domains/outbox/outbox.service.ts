import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { NOTIFICATION_SERVICE } from '../services/constants';
import { Outbox, OutboxDocument } from './schemas/outbox';

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
  ) {}

  public async emit(topic: string, payload: string, session?: ClientSession): Promise<OutboxDocument[]> {
    return await this.outboxModel.create([{
      topic,
      payload,
    }], { session });
  }
}
