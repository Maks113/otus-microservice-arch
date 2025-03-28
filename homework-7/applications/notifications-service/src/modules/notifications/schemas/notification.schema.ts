import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification, object, object>;

@Schema()
export class Notification {
  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  subject: string;

  @Prop()
  message: string;

  @Prop({ required: true })
  timestamp: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
