import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from '../mongo/mongo.module';
import { ServiceLocatorModule } from '../services/services.module';
import { OutboxEventsRouter } from './outbox.router';
import { OutboxService } from './outbox.service';
import { OutboxWorker } from './outbox.worker';
import { Outbox, OutboxSchema } from './schemas/outbox';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([{ name: Outbox.name, schema: OutboxSchema }]),
    ServiceLocatorModule,
  ],
  providers: [
    OutboxEventsRouter,
    OutboxWorker,
    OutboxService,
  ],
  exports: [
    OutboxService,
  ]
})
export class OutboxModule {}
