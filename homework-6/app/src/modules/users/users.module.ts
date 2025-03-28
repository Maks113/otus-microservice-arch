import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { MongoModule } from '../mongo/mongo.module';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(UsersController);
  }
}
