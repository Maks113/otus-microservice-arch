import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigurationModule } from '../configuration/configuration.module';
import { PAGE_CAPTURE_SERVICE, SCREENSHOT_REQUEST_SERVICE } from './constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigurationModule],
        name: SCREENSHOT_REQUEST_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: PAGE_CAPTURE_SERVICE,
              brokers: configService.get<string[]>('kafka.brokers')!,
            },
            consumer: {
              groupId: configService.get<string>('services.screenshotRequest.groupId')!,
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
