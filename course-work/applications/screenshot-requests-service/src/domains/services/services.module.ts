import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigurationModule } from '../configuration/configuration.module';
import {
  CONSUMER_SERVICE,
  NOTIFICATION_SERVICE,
  PAGE_CAPTURE_SERVICE,
  SCREENSHOT_META_SERVICE,
  SCREENSHOT_REQUEST_SERVICE,
} from './constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigurationModule],
        name: NOTIFICATION_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: SCREENSHOT_REQUEST_SERVICE,
              brokers: configService.get<string[]>('kafka.brokers')!,
            },
            consumer: {
              groupId: configService.get<string>('services.notifications.groupId')!,
            }
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigurationModule],
        name: CONSUMER_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: SCREENSHOT_REQUEST_SERVICE,
              brokers: configService.get<string[]>('kafka.brokers')!,
            },
            consumer: {
              groupId: configService.get<string>('services.consumer.groupId')!,
            }
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigurationModule],
        name: PAGE_CAPTURE_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: SCREENSHOT_REQUEST_SERVICE,
              brokers: configService.get<string[]>('kafka.brokers')!,
            },
            consumer: {
              groupId: configService.get<string>('services.pageCapture.groupId')!,
            }
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigurationModule],
        name: SCREENSHOT_META_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: SCREENSHOT_REQUEST_SERVICE,
              brokers: configService.get<string[]>('kafka.brokers')!,
            },
            consumer: {
              groupId: configService.get<string>('services.screenshotMeta.groupId')!,
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
