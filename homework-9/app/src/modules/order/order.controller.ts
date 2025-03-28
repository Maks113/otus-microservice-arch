import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { OrderCreateDto } from './dto/order.create.dto';
import { OrderService } from './order.service';
import { OrderDocument } from './schemas/order.schema';

@Controller('order')
export class OrderController {
  constructor(
    private readonly appService: OrderService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrderController.name);
  }

  @Post('')
  async create(
    @Res() res: Response,
    @Body() body: OrderCreateDto,
  ): Promise<void> {
    try {
      const created = await this.appService.create(body);
      res.status(HttpStatus.CREATED).send(created);
    } catch (e) {
      res.status(409).send();
    }
  }

  @Get('')
  async readAll(): Promise<OrderDocument[]> {
    return this.appService.list();
  }
}
