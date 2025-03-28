import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  balance: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
