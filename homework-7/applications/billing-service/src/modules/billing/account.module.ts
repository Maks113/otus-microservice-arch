import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { MongoModule } from '../mongo/mongo.module';
import { Account, AccountSchema } from './schemas/account.schema';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(AccountController);
  }
}
