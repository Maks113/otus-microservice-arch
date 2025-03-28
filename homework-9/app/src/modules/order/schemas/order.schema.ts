import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class Order {
  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, unique: true, })
  idempotencyKey: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
