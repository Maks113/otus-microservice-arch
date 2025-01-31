import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { ConsumerKeepEvent } from '../../domains/consumer/events/ConsumerKeepEvent';
import { ConsumerReleaseEvent } from '../../domains/consumer/events/ConsumerReleaseEvent';
import { NotificationEvent } from '../../domains/notifications/events/notificationEvent';
import { OutboxService } from '../../domains/outbox/outbox.service';
import { PageCaptureCreateEvent } from '../../domains/page-capture/events/PageCaptureCreateEvent';
import { PageCaptureDeleteEvent } from '../../domains/page-capture/events/PageCaptureDeleteEvent';
import { ScreenshotMetaCreateEvent } from '../../domains/screenshot-meta/events/ScreenshotMetaCreateEvent';
import { RequestCreateDto } from './dto/requestCreateDto';
import { ScreenshotRequest, ScreenshotRequestDocument } from './schemas/screenshot-request';


@Injectable()
export class ScreenshotRequestService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(ScreenshotRequest.name) private screenshotRequestModel: Model<ScreenshotRequest>,
    private readonly outboxService: OutboxService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ScreenshotRequestService.name);
  }

  async createRequest(requestDto: RequestCreateDto): Promise<ScreenshotRequestDocument | undefined> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const request = await this.screenshotRequestModel.create([{
        currentStep: 0,
        errors: [],
        status: 'pending',
        payload: {
          link: requestDto.link,
          userEmail: requestDto.userEmail,
        },
        metadataId: null,
        imageName: null,
      }], { session });

      await session.commitTransaction();
      this.logger.info({
        msg: 'request created',
        request,
      })
      return request[0];
    } catch (e) {
      await session.abortTransaction();
      this.logger.error(e)
      throw e;
    }
    finally {
      await session.endSession();
    }
  }

  async failRequest(requestId: string | Types.ObjectId): Promise<void> {
    await this.screenshotRequestModel.findByIdAndUpdate(requestId, { $set: { status: 'failed' } });
  }

  async keepUserRequest(requestId: string | Types.ObjectId, payload): Promise<void> {
    await this.outboxService.emit(
      'consumer.keep',
      JSON.stringify(new ConsumerKeepEvent(requestId.toString(), payload.userEmail)),
    );
  }

  async releaseUserRequest(requestId: string | Types.ObjectId, payload): Promise<void> {
    await this.outboxService.emit(
      'consumer.release',
      JSON.stringify(new ConsumerReleaseEvent(requestId.toString(), payload.userEmail)),
    );
  }

  async takePageCapture(requestId: string | Types.ObjectId, payload): Promise<void> {
    await this.outboxService.emit(
      'page-capture.create',
      JSON.stringify(new PageCaptureCreateEvent(requestId.toString(), payload.link)),
    );
  }

  async deletePageCapture(requestId: string | Types.ObjectId, payload): Promise<void> {
    await this.outboxService.emit(
      'page-capture.delete',
      JSON.stringify(new PageCaptureDeleteEvent(requestId.toString(), payload.imageName)),
    );
  }

  async addScreenshotMeta(requestId: string | Types.ObjectId, payload): Promise<void> {
    await this.outboxService.emit(
      'screenshot-meta.create',
      JSON.stringify(new ScreenshotMetaCreateEvent(requestId.toString(), payload.link, payload.hash ,payload.imageName)),
    );
  }

  async sendNotification(requestId: string | Types.ObjectId, payload): Promise<void> {
    await this.outboxService.emit(
      'notification.send',
      JSON.stringify(new NotificationEvent(requestId.toString(), payload.email, 'Screenshot is ready', '')),
    );
  }

  getForUser(userEmail: string): Promise<ScreenshotRequestDocument[]> {
    return this.screenshotRequestModel
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .exec();
  }
}
