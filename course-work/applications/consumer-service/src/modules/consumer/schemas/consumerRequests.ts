import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConsumerDocument = HydratedDocument<ConsumerRequests>;

@Schema({ timestamps: true })
export class ConsumerRequests {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true })
  status: 'keep' | 'released'
}

export const ConsumerSchema = SchemaFactory.createForClass(ConsumerRequests);
