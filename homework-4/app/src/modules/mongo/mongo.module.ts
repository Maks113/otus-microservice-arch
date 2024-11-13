import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';
import { PinoLogger } from 'nestjs-pino';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService, PinoLogger],
      useFactory: async (configService: ConfigService,  logger: PinoLogger): Promise<MongooseModuleFactoryOptions> => {
        const host = configService.get<string>('mongo.host');
        const port = configService.get<string>('mongo.port');
        const username = configService.get<string>('mongo.username');
        const password = configService.get<string>('mongo.password');

        return {
          uri: `mongodb://${username}${password ? `:${password}` : '' }@${host}:${port}`,
          dbName: 'app',
          authMechanism: 'SCRAM-SHA-1',
        };
      },
    }),
    // MongooseModule.forRoot('mongodb://root:example@mongo:27017'),
    // MongooseModule.forRootAsync({
    //   connectionName: 'main',
    //   useFactory: async () => ({ uri: 'mongodb://root:example@mongo:27017' }),
    // }),
  ],
  exports: [],
})
export class MongoModule {}
