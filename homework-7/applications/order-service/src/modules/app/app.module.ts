import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { HealthcheckModule } from '../healthcheck/healthcheck.module';
import { MetricsModule } from '../metrics/metrics.module';
import { MongoModule } from '../mongo/mongo.module';
import { OrdersModule } from '../orders/orders.module';
import { PinoLoggerModule } from '../pino-logger/pino-logger.module';

@Module({
  imports: [
    ConfigurationModule,
    PinoLoggerModule,
    MetricsModule,
    MongoModule,
    HealthcheckModule,

    OrdersModule,
  ],
  providers: [],
})
export class AppModule {}
