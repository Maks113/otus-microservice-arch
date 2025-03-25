import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
    // MongooseModule.forRootAsync({
    //   connectionName: 'main',
    //   useFactory: async () => ({ uri: 'mongodb://root:example@mongo:27017' }),
    // }),

    UsersModule,
    HealthcheckModule,
  ],
  exports: [],
})
export class AppModule {}
