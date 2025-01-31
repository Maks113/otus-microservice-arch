import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from '../../domains/mongo/mongo.module';
import { ServiceLocatorModule } from '../../domains/services/services.module';
import { ConsumerRequests, ConsumerSchema } from './schemas/consumerRequests';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [
    MongoModule,
    ServiceLocatorModule,
    MongooseModule.forFeature([{ name: ConsumerRequests.name, schema: ConsumerSchema }])
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
})
export class ConsumerModule {}
