import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { OrderCreateDto } from './dto/order.create.dto';
import { OrdersService } from './orders.service';

@Controller('order')
export class OrdersController {
  constructor(
    private readonly appService: OrdersService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrdersController.name);
  }

  @Post()
  async orderCreate(
    @Body() orderCreateDto: OrderCreateDto,
    @Res() res: Response,
  ) {
    try {
      await this.appService.create(orderCreateDto);
      res.status(201).send();
    } catch (e: unknown) {
      res.status(400).send();
    }
  }
}
