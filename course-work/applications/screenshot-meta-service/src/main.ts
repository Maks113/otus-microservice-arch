import otelSDK from './tracing';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';
import { ConfigurationModule } from './domains/configuration/configuration.module';
import { SCREENSHOT_REQUEST_SERVICE } from './domains/services/constants';
import { ClassValidatorPlugin } from './plugins/class-validator.plugin';
import { LoggerPlugin } from './plugins/logger.plugin';
import { SwaggerPlugin } from './plugins/swagger.plugin';

async function bootstrap() {
  // otelSDK.start();

  const configContext = await NestFactory.createApplicationContext(
    ConfigurationModule,
  );
  const configService = configContext.get(ConfigService);

  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));


  const logger = app.get(Logger);

  [
    LoggerPlugin,
    ClassValidatorPlugin,
    SwaggerPlugin,
  ].forEach((plugin) => plugin(app));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: SCREENSHOT_REQUEST_SERVICE,
        brokers: configService.get<string[]>('kafka.brokers')!,
      },
      consumer: {
        groupId: configService.get<string>('kafka.groupId')!,
      },
      producer: {
        allowAutoTopicCreation: true,
      },
    }
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3000;
  logger.log('App running on:', `http://localhost:${port}`);
  await app.listen(port);
}
bootstrap().then();
