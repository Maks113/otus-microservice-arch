import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module';
import { PinoLoggerModule } from '../pino-logger/pino-logger.module';
import { RestModule } from '../rest/rest.module';

@Module({
  imports: [
    PinoLoggerModule,
    RestModule,
    MetricsModule,
  ],
})
export class AppModule {}
