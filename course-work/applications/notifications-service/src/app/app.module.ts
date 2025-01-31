import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigurationModule } from '../domains/configuration/configuration.module';
import { NotificationsModule } from '../domains/notifications/notifications.module';
import { PinoLoggerModule } from '../domains/pino-logger/pino-logger.module';

@Module({
  imports: [
    ConfigurationModule,
    PinoLoggerModule,

    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        app: 'notification-service'
      }
    }),

    NotificationsModule,
  ],
})
export class AppModule {}
