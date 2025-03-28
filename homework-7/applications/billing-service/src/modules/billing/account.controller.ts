import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AccountService } from './account.service';
import { AccountCreateDto } from './dto/account.create.dto';
import { AccountUpdateDto } from './dto/account.update.dto';
import { AccountDocument } from './schemas/account.schema';

@Controller('account')
export class AccountController {
  constructor(
    private readonly appService: AccountService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AccountController.name);
  }

  @Get(':userId')
  async readByUserId(
    @Param('userId') userId: string,
  ): Promise<AccountDocument> {
    return await this.appService.getByUsername(userId);
  }

  @Get()
  async getList(): Promise<AccountDocument[]> {
    return await this.appService.getAccountList();
  }

  @Post()
  async create(@Body() payload: AccountCreateDto): Promise<AccountDocument> {
    return this.appService.create(payload.userId, payload.initialBalance);
  }

  @Post(':userId/withdraw')
  async withdraw(
    @Param('userId') userId: string,
    @Body() payload: AccountUpdateDto,
  ): Promise<AccountDocument> {
    return await this.appService.balanceChange(userId, -Math.abs(payload.value));
  }

  @Post(':userId/top-up')
  async topUp(
    @Param('userId') userId: string,
    @Body() payload: AccountUpdateDto,
  ): Promise<AccountDocument> {
    return await this.appService.balanceChange(userId, Math.abs(payload.value));
  }
}
