import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { TraceCarrier } from '../../common/TraceCarrier';
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

  async failRequest(request: ScreenshotRequestDocument): Promise<void> {
    await this.screenshotRequestModel.findByIdAndUpdate(request._id, { $set: { status: 'failed' } });
  }

  async keepUserRequest(request: ScreenshotRequestDocument, payload, traceCarrier?: TraceCarrier): Promise<void> {
    await this.outboxService.emit(
      'consumer.keep',
      JSON.stringify(new ConsumerKeepEvent(request.id, payload.userEmail)),
      traceCarrier,
    );
  }

  async releaseUserRequest(request: ScreenshotRequestDocument, payload, traceCarrier?: TraceCarrier): Promise<void> {
    await this.outboxService.emit(
      'consumer.release',
      JSON.stringify(new ConsumerReleaseEvent(request.id, payload.userEmail)),
      traceCarrier,
    );
  }

  async takePageCapture(request: ScreenshotRequestDocument, payload, traceCarrier?: TraceCarrier): Promise<void> {
    await this.outboxService.emit(
      'page-capture.create',
      JSON.stringify(new PageCaptureCreateEvent(request.id, payload.link)),
      traceCarrier,
    );
  }

  async deletePageCapture(request: ScreenshotRequestDocument, payload, traceCarrier?: TraceCarrier): Promise<void> {
    await this.outboxService.emit(
      'page-capture.delete',
      JSON.stringify(new PageCaptureDeleteEvent(request.id, payload.imageName)),
      traceCarrier,
    );
  }

  async addScreenshotMeta(request: ScreenshotRequestDocument, payload, traceCarrier?: TraceCarrier): Promise<void> {
    await this.outboxService.emit(
      'screenshot-meta.create',
      JSON.stringify(new ScreenshotMetaCreateEvent(request.id, payload.link, payload.hash ,payload.imageName)),
      traceCarrier,
    );
  }

  async sendSuccessNotification(request: ScreenshotRequestDocument, payload, traceCarrier?: TraceCarrier): Promise<void> {
    await this.outboxService.emit(
      'notification.send',
      JSON.stringify(new NotificationEvent(request.id, payload.email, `Screenshot is ready: http://localhost/${request.id}`, '')),
      traceCarrier,
    );
  }

  async sendFailNotification(request: ScreenshotRequestDocument, payload, traceCarrier?: TraceCarrier): Promise<void> {
    await this.outboxService.emit(
      'notification.send',
      JSON.stringify(new NotificationEvent(request.id, payload.email, `Error while creating screenshot: ${request?.errors?.join('')}`, '')),
      traceCarrier,
    );
  }

  async getForUser(userEmail: string): Promise<ScreenshotRequestDocument[]> {
    return (await this.screenshotRequestModel
      .find({ 'payload.userEmail': userEmail })
      .sort({ createdAt: -1 })
      .exec())
      .map((r: ScreenshotRequestDocument): ScreenshotRequestDocument => {
        if (r?.payload?.traceCarrier) r.payload.traceCarrier = null;
        return r
      });
  }
}
