import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ConfigurationModule } from '../domains/configuration/configuration.module';
import { MongoModule } from '../domains/mongo/mongo.module';
import { PinoLoggerModule } from '../domains/pino-logger/pino-logger.module';
import { PageCaptureModule } from '../modules/page-capture/page-capture.module';

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
        app: 'page-capture-service'
      }
    }),

    PageCaptureModule,
  ],
})
export class AppModule {}
