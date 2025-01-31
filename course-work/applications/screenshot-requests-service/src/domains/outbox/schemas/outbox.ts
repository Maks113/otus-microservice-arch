import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OutboxDocument = HydratedDocument<Outbox>;

@Schema({ timestamps: true })
export class Outbox {

  @Prop({
    required: true,
    default: () => 0,
  })
  attempts: number;

  @Prop({
    required: true,
    default: () => 'pending',
  })
  status: 'pending' | 'processed';

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  payload: string;
}

export const OutboxSchema = SchemaFactory.createForClass(Outbox);
