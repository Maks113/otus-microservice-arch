import { Body, Controller, Delete, Get, Param, Put, Req, Res } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { OrderUpdateDto } from './dto/order.update.dto';
import { UserDocument } from './schemas/order.schema';
import { OrdersService } from './orders.service';

@Controller('user')
export class OrdersController {
  constructor(
    private readonly appService: OrdersService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OrdersController.name);
  }

  @Get(':username')
  async readByUsername(
    @Req() req: Request,
    @Res() res: Response,
    @Param('username') username: string,
  ): Promise<UserDocument> {
    if (username !== (req as any).user.username) {
      res.status(401).send({ error: 'Unauthorized request' });
      return;
    }

    res.send(await this.appService.getByUsername(username));
  }

  @Put(':username')
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('username') username: string,
    @Body() body: OrderUpdateDto,
  ): Promise<UserDocument> {
    if (username !== (req as any).user.username) {
      res.status(401).send({ error: 'Unauthorized request' });
      return;
    }

    res.send(await this.appService.updateByUsername(username, body));
  }

  @Delete(':username')
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('username') username: string,
  ): Promise<UserDocument> {
    if (username !== (req as any).user.username) {
      res.status(401).send({ error: 'Unauthorized request' });
      return;
    }

    res.send(await this.appService.deleteByUsername(username));
  }
}
