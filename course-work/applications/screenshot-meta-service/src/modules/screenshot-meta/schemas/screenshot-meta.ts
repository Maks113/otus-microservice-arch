import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScreenshotMetaDocument = HydratedDocument<ScreenshotMeta>;

@Schema({ timestamps: true })
export class ScreenshotMeta {
  @Prop({ required: true })
  link: string;

  @Prop({ required: true, unique: true })
  hash: string;

  @Prop({ required: true, unique: true })
  requestId: string;

  @Prop({ required: true })
  filename: string;
}

export const ScreenshotMetaSchema = SchemaFactory.createForClass(ScreenshotMeta);
