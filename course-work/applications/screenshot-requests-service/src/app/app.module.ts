import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigurationModule } from '../domains/configuration/configuration.module';
import { MongoModule } from '../domains/mongo/mongo.module';
import { PinoLoggerModule } from '../domains/pino-logger/pino-logger.module';
import { OutboxModule } from '../domains/outbox/outbox.module';
import { ScreenshotRequestModule } from '../modules/screenshot-request/screenshot-request.module';

@Module({
  imports: [
    ConfigurationModule,
    PinoLoggerModule,
    MongoModule,

    OutboxModule,

    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        app: 'screenshot-requests-service'
      }
    }),

    ScreenshotRequestModule,
  ],
})
export class AppModule {}
