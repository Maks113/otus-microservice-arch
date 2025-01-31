import { Module } from '@nestjs/common';
import { ServiceLocatorModule } from '../../domains/services/services.module';
import { PageCaptureController } from './page-capture.controller';
import { PageCaptureService } from './page-capture.service';

@Module({
  imports: [
    ServiceLocatorModule,
  ],
  controllers: [PageCaptureController],
  providers: [PageCaptureService],
})
export class PageCaptureModule {}
