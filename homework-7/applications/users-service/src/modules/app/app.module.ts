import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { HealthcheckModule } from '../healthcheck/healthcheck.module';
import { MetricsModule } from '../metrics/metrics.module';
import { MongoModule } from '../mongo/mongo.module';
import { PinoLoggerModule } from '../pino-logger/pino-logger.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigurationModule,
    PinoLoggerModule,
    MetricsModule,
    MongoModule,

    UsersModule,
    HealthcheckModule,
  ],
  exports: [],
})
export class AppModule {}
