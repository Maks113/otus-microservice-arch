import { Body, Controller, Delete, Get, Param, Put, Req, Res } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { UserUpdateDto } from './dto/user.update.dto';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly appService: UsersService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersController.name);
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
    @Body() body: UserUpdateDto,
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
