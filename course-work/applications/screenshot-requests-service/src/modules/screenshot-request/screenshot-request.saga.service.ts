import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { RequestCreateDto } from './dto/requestCreateDto';
import { ScreenshotRequest } from './schemas/screenshot-request';
import { ScreenshotRequestService } from './screenshot-request.service';

@Injectable()
export class ScreenshotRequestSagaService {
  constructor(
    @InjectModel(ScreenshotRequest.name) private screenshotRequestModel: Model<ScreenshotRequest>,
    private readonly screenshotRequestService: ScreenshotRequestService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ScreenshotRequestSagaService.name);
  }

  private steps: {
    action: (requestId: string | Types.ObjectId, payload: any) => Promise<void>,
    compensation: ((requestId: string, payload: any) => Promise<void>) | null
  }[] = [
    { action: this.createRequest.bind(this), compensation: this.failRequest.bind(this) },
    { action: this.keepUserRequest.bind(this), compensation: this.releaseUserRequestCompensation.bind(this) },
    { action: this.takePageCapture.bind(this), compensation: this.deletePageCapture.bind(this) },
    { action: this.saveMeta.bind(this), compensation: null },
    { action: this.releaseUserRequest.bind(this), compensation: null },
    { action: this.sendNotification.bind(this), compensation: null },
  ];

  async startSaga(data: RequestCreateDto): Promise<void> {
    await this.steps[0].action('', data);
  }

  // Переход к следующему шагу
  async nextStep(requestId: Types.ObjectId | string, payload: any): Promise<void> {
    const request = await this.screenshotRequestModel.findById(requestId).exec();
    if (!request) {
      this.logger.error('Cannot find screenshotRequest');
      return;
    }
    if (['compensating', 'failed', 'completed'].includes(request.status)) {
      return;
    }
    request.currentStep += 1;
    request.payload = { ...request.payload, ...payload };
    if (request.currentStep >= this.steps.length - 1) {
      request.status = 'completed';
    }
    this.logger.info({
      title: 'next step',
      request,
    });
    await request.save();
    await this.steps[request.currentStep].action(requestId, request.payload);
  }

  // Запуск компенсации
  async compensate(requestId: string, error: string): Promise<void> {
    const request = await this.screenshotRequestModel.findById(requestId).exec();
    if (!request) {
      this.logger.error('Cannot find screenshotRequest');
      return;
    }
    request.status = 'compensating';
    request.errors.push(error);
    await request.save();
    for (let i = request.currentStep; i >= 0; i--) {
      await this.steps[i].compensation?.(requestId, request.payload);
    }
  }

  // async markCompensated(requestId: string) {
  //   const request = await this.screenshotRequestModel.findById(requestId).exec();
  //   if (!request) {
  //     this.logger.error('[markCompensated] Cannot find screenshotRequest');
  //     return;
  //   }
  //   request.compensatedSteps += 1;
  //   this.logger.info({ title: 'Compensation', request });
  //   if (request.compensatedSteps === request.currentStep) {
  //     request.status = 'failed';
  //   }
  //   await request.save();
  // }

  async createRequest(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'createRequest',
    });
    const request = await this.screenshotRequestService.createRequest(payload);
    if (!request) {
      throw new Error('Cant create request');
    }
    await this.nextStep(request._id, {});
  }

  async failRequest(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'failRequest',
    });
    await this.screenshotRequestService.failRequest(requestId);
    // await this.markCompensated(requestId);
  }

  async keepUserRequest(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'keepUserRequest',
    });
    await this.screenshotRequestService.keepUserRequest(requestId, payload);
  }

  async releaseUserRequest(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'releaseUserRequest',
    });
    await this.screenshotRequestService.releaseUserRequest(requestId, payload);
  }

  async releaseUserRequestCompensation(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'releaseUserRequestCompensation',
    });
    await this.screenshotRequestService.releaseUserRequest(requestId, payload);
    // await this.markCompensated(requestId);
  }

  async takePageCapture(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'takePageCapture',
    });
    await this.screenshotRequestService.takePageCapture(requestId, payload);
  }

  async deletePageCapture(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'deletePageCapture',
    });
    await this.screenshotRequestService.deletePageCapture(requestId, payload);
    // await this.markCompensated(requestId);
  }

  async saveMeta(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'saveMeta',
    });
    await this.screenshotRequestService.addScreenshotMeta(requestId, payload);
  }

  async sendNotification(requestId, payload) {
    this.logger.info({
      saga: requestId,
      msg: 'sendNotification',
    });
    await this.screenshotRequestService.sendNotification(requestId, payload);
  }
}
