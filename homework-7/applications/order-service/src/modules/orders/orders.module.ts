import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from '../../middleware/auth.middleware';
import { MongoModule } from '../mongo/mongo.module';
import { User, OrderSchema } from './schemas/order.schema';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([{ name: User.name, schema: OrderSchema }])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(OrdersController);
  }
}
