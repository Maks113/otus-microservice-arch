import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { endOfDay, startOfDay } from 'date-fns';
import { Connection, Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { ConsumerKeepEvent } from './dto/ConsumerKeepEvent';
import { ConsumerReleaseEvent } from './dto/ConsumerReleaseEvent';
import { ConsumerRequests } from './schemas/consumerRequests';

@Injectable()
export class ConsumerService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(ConsumerRequests.name)
    private consumerModel: Model<ConsumerRequests>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ConsumerService.name);
  }

  async keepUserRequest(event: ConsumerKeepEvent): Promise<string | null> {
    const session = await this.connection.startSession();
    let error: null | string = null;
    await session.withTransaction(async (session) => {
      const dayUserRequests = await this.consumerModel.countDocuments({
        email: event.email,
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      });

      const activeUserRequests = await this.consumerModel.countDocuments({
        email: event.email,
        status: 'keep',
      });

      const isDuplicate = Boolean(
        await this.consumerModel.countDocuments({
          requestsId: event.requestId,
          email: event.email,
        }),
      );

      this.logger.info({
        event,
        isDuplicate,
        dayUserRequests,
        activeUserRequests,
      });

      if (isDuplicate) {
        return;
      }

      if (dayUserRequests >= 100) {
        error =
          'The user has reached the requests limit (100) for the day. Try again later';
        return;
      }

      if (activeUserRequests > 3) {
        error = 'Only 3 requests from the user can be executed in parallel';
        return;
      }

      await this.consumerModel.create(
        [
          {
            requestId: event.requestId,
            email: event.email,
            status: 'keep',
          },
        ],
        { session },
      );
    });

    return error;
  }

  async releaseUserRequest(event: ConsumerReleaseEvent) {
    await this.consumerModel.findOneAndUpdate(
      {
        email: event.email,
        requestId: event.requestId,
        status: 'keep',
      },
      { $set: { status: 'released' } },
    );
  }
}
