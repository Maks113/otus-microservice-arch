import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import opentelemetry, { Tracer } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { Model, Types } from 'mongoose';
import { Span } from 'nestjs-otel';
import { PinoLogger } from 'nestjs-pino';
import { TraceCarrier } from '../../common/TraceCarrier';
import { RequestCreateDto } from './dto/requestCreateDto';
import { ScreenshotRequest } from './schemas/screenshot-request';
import { ScreenshotRequestService } from './screenshot-request.service';

@Injectable()
export class ScreenshotRequestSagaService {
  tracer: Tracer;

  constructor(
    @InjectModel(ScreenshotRequest.name) private screenshotRequestModel: Model<ScreenshotRequest>,
    private readonly screenshotRequestService: ScreenshotRequestService,
    private readonly logger: PinoLogger,
  ) {
    this.tracer = opentelemetry.trace.getTracer(ScreenshotRequestSagaService.name);
    this.logger.setContext(ScreenshotRequestSagaService.name);
  }

  private steps: {
    action: (requestId: string | Types.ObjectId, payload: any, traceCarrier?: TraceCarrier) => Promise<void>,
    compensation: ((requestId: string, payload: any, traceCarrier?: TraceCarrier) => Promise<void>) | null
  }[] = [
    { action: this.createRequest.bind(this), compensation: this.failRequest.bind(this) },
    { action: this.keepUserRequest.bind(this), compensation: this.releaseUserRequestCompensation.bind(this) },
    { action: this.takePageCapture.bind(this), compensation: this.deletePageCapture.bind(this) },
    { action: this.saveMeta.bind(this), compensation: null },
    { action: this.releaseUserRequest.bind(this), compensation: null },
    { action: this.sendNotification.bind(this), compensation: null },
  ];

  @Span()
  async startSaga(data: RequestCreateDto): Promise<void> {
    await this.steps[0].action('', data);
  }

  // Переход к следующему шагу
  @Span()
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
    const traceCarrier = {};
    api.propagation.inject(api.context.active(), traceCarrier);
    await this.steps[request.currentStep].action(requestId, request.payload, traceCarrier);
  }

  // Запуск компенсации
  @Span()
  async compensate(requestId: string, error: string): Promise<void> {
    const request = await this.screenshotRequestModel.findById(requestId).exec();
    if (!request) {
      this.logger.error('Cannot find screenshotRequest');
      return;
    }
    request.status = 'compensating';
    request.errors.push(error);
    await request.save();
    const traceCarrier = {};
    api.propagation.inject(api.context.active(), traceCarrier);
    for (let i = request.currentStep; i >= 0; i--) {
      await this.steps[i].compensation?.(requestId, request.payload, traceCarrier);
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

  @Span()
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

  @Span()
  async failRequest(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'failRequest',
    });
    await this.screenshotRequestService.failRequest(requestId);
    // await this.markCompensated(requestId);
  }

  @Span()
  async keepUserRequest(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'keepUserRequest',
    });
    await this.screenshotRequestService.keepUserRequest(requestId, payload, traceCarrier);
  }

  @Span()
  async releaseUserRequest(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'releaseUserRequest',
    });
    await this.screenshotRequestService.releaseUserRequest(requestId, payload, traceCarrier);
  }

  @Span()
  async releaseUserRequestCompensation(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'releaseUserRequestCompensation',
    });
    await this.screenshotRequestService.releaseUserRequest(requestId, payload, traceCarrier);
    // await this.markCompensated(requestId);
  }

  @Span()
  async takePageCapture(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'takePageCapture',
    });
    await this.screenshotRequestService.takePageCapture(requestId, payload, traceCarrier);
  }

  @Span()
  async deletePageCapture(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'deletePageCapture',
    });
    await this.screenshotRequestService.deletePageCapture(requestId, payload, traceCarrier);
    // await this.markCompensated(requestId);
  }

  @Span()
  async saveMeta(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'saveMeta',
    });
    await this.screenshotRequestService.addScreenshotMeta(requestId, payload, traceCarrier);
  }

  @Span()
  async sendNotification(requestId, payload, traceCarrier) {
    this.logger.info({
      saga: requestId,
      msg: 'sendNotification',
    });
    await this.screenshotRequestService.sendNotification(requestId, payload, traceCarrier);
  }
}
