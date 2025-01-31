import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigurationModule } from '../domains/configuration/configuration.module';
import { MongoModule } from '../domains/mongo/mongo.module';
import { PinoLoggerModule } from '../domains/pino-logger/pino-logger.module';
import { ScreenshotMetaModule } from '../modules/screenshot-meta/screenshot-meta.module';

@Module({
  imports: [
    ConfigurationModule,
    PinoLoggerModule,
    MongoModule,

    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        app: 'screenshot-meta-service'
      }
    }),

    ScreenshotMetaModule,
  ],
})
export class AppModule {}
