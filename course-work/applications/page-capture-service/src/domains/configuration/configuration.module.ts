import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import kafkaConfig from './kafka.config';
import minioConfig from './minio.config';
import mongoConfig from './mongo.config';
import servicesConfig from './services.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        mongoConfig,
        kafkaConfig,
        servicesConfig,
        minioConfig,
      ]
    }),
  ],
})
export class ConfigurationModule {}
