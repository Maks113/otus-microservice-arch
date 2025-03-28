import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigurationModule } from '../configuration/configuration.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigurationModule],
        name: 'notifications-service',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'orders-service',
              brokers: configService.get<string[]>('kafka.brokers')!,
            },
            consumer: {
              groupId: 'notifications-service',
            },
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
