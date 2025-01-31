import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from '../../domains/mongo/mongo.module';
import { ServiceLocatorModule } from '../../domains/services/services.module';
import { ScreenshotMeta, ScreenshotMetaSchema } from './schemas/screenshot-meta';
import { ScreenshotMetaController } from './screenshot-meta.controller';
import { ScreenshotMetaService } from './screenshot-meta.service';

@Module({
  imports: [
    MongoModule,
    ServiceLocatorModule,
    MongooseModule.forFeature([{ name: ScreenshotMeta.name, schema: ScreenshotMetaSchema }])
  ],
  controllers: [ScreenshotMetaController],
  providers: [ScreenshotMetaService],
})
export class ScreenshotMetaModule {}
