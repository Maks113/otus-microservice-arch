import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderCreateDto } from './dto/order.create.dto';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private userModel: Model<Order>) {}

  async create(user: OrderCreateDto): Promise<OrderDocument> {
    const newUser: OrderDocument = new this.userModel(user);
    return newUser.save();
  }

  list(): Promise<OrderDocument[]> {
    return this.userModel.find().exec();
  }
}
