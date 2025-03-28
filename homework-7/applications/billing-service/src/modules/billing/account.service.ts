import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async create(
    userId: string,
    initialBalance: number,
  ): Promise<AccountDocument> {
    return await this.accountModel.create({ userId, balance: initialBalance });
  }

  async getByUsername(userId: string): Promise<AccountDocument> {
    return await this.accountModel.findOne({ userId }).exec();
  }

  async getAccountList(): Promise<AccountDocument[]> {
    return await this.accountModel.find().exec();
  }

  async balanceChange(
    userId: string,
    amount: number,
  ): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({ userId }).exec();
    if (amount < 0 && account.balance < Math.abs(amount)) {
      throw new BadRequestException('The account balance is less than the amount');
    }

    account.balance += amount;
    await account.save();
    return account;
  }
}
