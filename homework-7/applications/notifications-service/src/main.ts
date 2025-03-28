import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { ConfigurationModule } from './domains/configuration/configuration.module';
import { ClassValidatorPlugin } from './plugins/class-validator.plugin';
import { LoggerPlugin } from './plugins/logger.plugin';

async function bootstrap() {
  const configContext = await NestFactory.createApplicationContext(
    ConfigurationModule
  );
  const configService = configContext.get(ConfigService);

  const app = await NestFactory.create(AppModule);

  [
    LoggerPlugin,
    ClassValidatorPlugin,
  ].forEach((plugin) => plugin(app));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notifications-service',
        brokers: configService.get<string[]>('kafka.brokers')!,
      },
      producer: {
        allowAutoTopicCreation: true,
      },
      consumer: {
        groupId: 'notifications-service',
      },
    }
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3000;
  console.log('App running on:', `http://localhost:${port}`);
  await app.listen(port);
}
void bootstrap().then();
