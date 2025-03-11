import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigurationModule } from '../configuration/configuration.module';
import { CONSUMER_SERVICE, SCREENSHOT_REQUEST_SERVICE } from './constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigurationModule],
        name: SCREENSHOT_REQUEST_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: CONSUMER_SERVICE,
              brokers: configService.get<string[]>('kafka.brokers')!,
            },
            consumer: {
              groupId: configService.get<string>('services.screenshotRequests.groupId')!,
            }
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [ClientsModule],
})
export class ServiceLocatorModule {}
