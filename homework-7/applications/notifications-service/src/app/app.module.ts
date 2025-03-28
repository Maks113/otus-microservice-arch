import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../domains/configuration/configuration.module';
import { MongoModule } from '../domains/mongo/mongo.module';
import { PinoLoggerModule } from '../domains/pino-logger/pino-logger.module';
import { HealthcheckModule } from '../modules/healthcheck/healthcheck.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigurationModule,
    PinoLoggerModule,
    MongoModule,

    HealthcheckModule,
    NotificationsModule,
  ],
})
export class AppModule {}
