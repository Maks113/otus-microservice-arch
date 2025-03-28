import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: PinoLogger,
  ) {}

  async getOrCreateUser(createDto: UserCreateDto): Promise<UserDocument> {
    const user: UserDocument = await this.getByUsername(createDto.username);
    if (!user) {
      this.logger.info({
        message: 'User not found. Creating...',
      });
      const newUser: UserDocument = new this.userModel(createDto);
      return newUser.save();
    }
    this.logger.info({
      message: 'User found. ',
      user,
    });

    return user;
  }

  getByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username }).exec();
  }

  list(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  deleteByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOneAndDelete({ username }).exec();
  }

  updateByUsername(
    username: string,
    body: UserUpdateDto,
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate({ username }, body).exec();
  }
}
