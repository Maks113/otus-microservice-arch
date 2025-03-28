import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { AccountDocument, Account } from './schemas/account.schema';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private readonly logger: PinoLogger,
  ) {}

  async create(userId: string, initialBalance: number): Promise<AccountDocument> {
    return await this.accountModel.create({ userId, balance: initialBalance });
  }

  async getByUsername(userId: string): Promise<AccountDocument> {
    return await this.accountModel.findOne({ userId }).exec();
  }

  async getAccountList(): Promise<AccountDocument[]> {
    return await this.accountModel.find().exec();
  }

  async balanceChange(userId: string, amount: number): Promise<AccountDocument> {
    return await this.accountModel.findOneAndUpdate({ userId }, { $dec: { 'balance': amount } }).exec();
  }
}
