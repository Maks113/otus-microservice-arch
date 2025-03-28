import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { HealthcheckModule } from '../healthcheck/healthcheck.module';
import { MetricsModule } from '../metrics/metrics.module';
import { MongoModule } from '../mongo/mongo.module';
import { PinoLoggerModule } from '../pino-logger/pino-logger.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    ConfigurationModule,
    PinoLoggerModule,
    MetricsModule,
    MongoModule,

    OrderModule,
    HealthcheckModule,
  ],
  exports: [],
})
export class AppModule {}
