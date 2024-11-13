import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module';
import { RestController } from './rest.controller';
import { RestService } from './rest.service';

@Module({
  imports: [MetricsModule],
  controllers: [RestController],
  providers: [RestService],
})
export class RestModule {}
