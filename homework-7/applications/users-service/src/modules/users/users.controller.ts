import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private readonly appService: UsersService,
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Post('')
  async create(
    @Res() res: Response,
    @Body() body: UserCreateDto,
  ): Promise<void> {
    const created = await this.appService.create(body);
    await firstValueFrom(this.httpService.post('http://billing.arch.homework/account/', {
      id: body.username,
      initialBalance: 0,
    }));

    res.status(HttpStatus.CREATED).send(created);
  }

  @Get('')
  async readAll(): Promise<UserDocument[]> {
    return this.appService.list();
  }

  @Get(':id')
  async readById(
    @Param('id') id: string,
  ): Promise<UserDocument> {
    return this.appService.getById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UserUpdateDto,
  ): Promise<UserDocument> {
    return this.appService.updateById(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ): Promise<UserDocument> {
    return this.appService.deleteById(id);
  }
}
