import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScreenshotRequestDocument = HydratedDocument<ScreenshotRequest>;

@Schema({ timestamps: true })
export class ScreenshotRequest {
  @Prop({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed' | 'compensating';

  @Prop()
  currentStep: number;

  @Prop({ type: Object })
  payload: any; // Данные саги

  @Prop({ type: [String], default: [] })
  errors: string[];

  @Prop({ required: false })
  traceId: string;

  @Prop({ required: false })
  spanId: string;

  // @Prop({ required: true })
  // link: string;
  //
  // @Prop({ required: false })
  // imageName: string | undefined;
  //
  // @Prop({ required: false })
  // metadataId: string | undefined;
}

export const ScreenshotRequestSchema = SchemaFactory.createForClass(ScreenshotRequest);
