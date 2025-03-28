import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from '../../middleware/metrics.interceptor';
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
    HealthcheckModule,

    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
