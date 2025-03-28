import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ServiceLocatorModule } from '../services/services.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    HttpModule,
    ServiceLocatorModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
