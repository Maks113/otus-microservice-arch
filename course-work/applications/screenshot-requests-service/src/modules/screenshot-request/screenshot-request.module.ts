import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from '../../domains/mongo/mongo.module';
import { OutboxModule } from '../../domains/outbox/outbox.module';
import { ServiceLocatorModule } from '../../domains/services/services.module';
import { ScreenshotRequest, ScreenshotRequestSchema } from './schemas/screenshot-request';
import { ScreenshotRequestController } from './screenshot-request.controller';
import { ScreenshotRequestHandler } from './screenshot-request.handler';
import { ScreenshotRequestSagaService } from './screenshot-request.saga.service';
import { ScreenshotRequestService } from './screenshot-request.service';

@Module({
  imports: [
    MongoModule,
    OutboxModule,
    ServiceLocatorModule,
    MongooseModule.forFeature([{ name: ScreenshotRequest.name, schema: ScreenshotRequestSchema }])
  ],
  controllers: [
    ScreenshotRequestController,
    ScreenshotRequestHandler,
  ],
  providers: [
    ScreenshotRequestService,
    ScreenshotRequestSagaService,
  ],
})
export class ScreenshotRequestModule {}
