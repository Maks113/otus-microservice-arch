import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(user: UserCreateDto): Promise<UserDocument> {
    const newUser: UserDocument = new this.userModel(user);
    await firstValueFrom(this.httpService.post('http://billing.arch.homework/account/', {
      userId: user.username,
      initialBalance: 0,
    }));
    return newUser.save()
  }

  getById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec()
  }

  list(): Promise<UserDocument[]> {
    return this.userModel.find().exec()
  }

  deleteById(id: string): Promise<UserDocument> {
    return this.userModel.findByIdAndDelete(id).exec()
  }

  updateById(id: string, body: UserUpdateDto): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, body).exec();
  }
}
