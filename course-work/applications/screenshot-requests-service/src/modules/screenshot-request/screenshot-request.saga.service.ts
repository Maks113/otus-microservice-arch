import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import opentelemetry, { trace, Tracer } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { Model, Types } from 'mongoose';
import { Span } from 'nestjs-otel';
import { PinoLogger } from 'nestjs-pino';
import { TraceCarrier } from '../../common/TraceCarrier';
import { RequestCreateDto } from './dto/requestCreateDto';
import { ScreenshotRequest, ScreenshotRequestDocument } from './schemas/screenshot-request';
import { ScreenshotRequestService } from './screenshot-request.service';

export type SagaStep = {
  action: (request: ScreenshotRequestDocument | null, payload: any, traceCarrier?: TraceCarrier) => Promise<void>;
  compensation: ((request: ScreenshotRequestDocument, payload: any, traceCarrier?: TraceCarrier) => Promise<void>) | null;
}

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

  private steps: SagaStep[] = [
    { action: this.createRequest.bind(this), compensation: this.failRequest.bind(this) },
    { action: this.keepUserRequest.bind(this), compensation: this.releaseUserRequestCompensation.bind(this) },
    { action: this.takePageCapture.bind(this), compensation: this.deletePageCapture.bind(this) },
    { action: this.saveMeta.bind(this), compensation: null },
    { action: this.releaseUserRequest.bind(this), compensation: null },
    { action: this.sendSuccessNotification.bind(this), compensation: null },
  ];

  @Span()
  async startSaga(data: RequestCreateDto): Promise<void> {
    await this.steps[0].action(null, data);
  }

  // Переход к следующему шагу
  @Span()
  async nextStep(requestId: Types.ObjectId | string, payload: any): Promise<void> {
    const request = await this.screenshotRequestModel.findById(requestId).exec();
    const span = trace.getActiveSpan();
    span?.setAttributes({
      'app.saga.id': request?._id.toString(),
      'app.saga.currentStep': request?.currentStep,
      'app.saga.payload': JSON.stringify(request?.payload),
    });
    this.logger.info({
      title: 'next step',
      request,
    });

    if (!request) {
      this.logger.error('Cannot find screenshotRequest');
      return;
    }
    if (['failed', 'completed'].includes(request.status)) {
      return;
    }
    if (!payload.error && request.status !== 'compensating') {
      await this.runAction(request, payload);
    } else {
      await this.compensate(request, payload.error);
    }
    span?.end();
  }

  @Span()
  private async runAction(request: ScreenshotRequestDocument, payload: any): Promise<void> {
    request.currentStep += 1;
    this.logger.info({
      msg: 'run next action',
      step: request.currentStep,
    });
    request.payload = { ...request.payload, ...payload };
    if (request.currentStep >= this.steps.length - 1) {
      request.status = 'completed';
    }
    await request.save();

    const traceCarrier = {};
    api.propagation.inject(api.context.active(), traceCarrier);
    await this.steps[request.currentStep].action(request, request.payload, traceCarrier);
  }

  // Запуск компенсации
  @Span()
  private async compensate(request: ScreenshotRequestDocument, error?: string): Promise<void> {
    request.currentStep -= 1;
    this.logger.info({
      msg: 'compensate step',
      step: request.currentStep,
    });
    if (request.currentStep < 0) {
      request.status = 'failed';
      return;
    }
    request.status = 'compensating';
    if (error) request.errors.push(error);
    await request.save();

    const traceCarrier = {};
    api.propagation.inject(api.context.active(), traceCarrier);
    const compensationFn = this.steps[request.currentStep].compensation;
    if (!compensationFn) {
      void this.compensate(request, error).then();
    } else {
      await this.steps[request.currentStep].compensation?.(request, request.payload, traceCarrier);
    }
  }

  @Span()
  async createRequest(_: ScreenshotRequestDocument, payload) {
    const request = await this.screenshotRequestService.createRequest(payload);
    this.logger.info({
      saga: request?._id,
      msg: 'createRequest',
    });
    if (!request) {
      throw new Error('Cant create request');
    }
    await this.nextStep(request._id, {});
  }

  @Span()
  async failRequest(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'failRequest',
    });
    await this.screenshotRequestService.failRequest(request);
    await this.screenshotRequestService.sendFailNotification(request, payload, traceCarrier);
  }

  @Span()
  async keepUserRequest(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'keepUserRequest',
    });
    await this.screenshotRequestService.keepUserRequest(request, payload, traceCarrier);
  }

  @Span()
  async releaseUserRequest(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'releaseUserRequest',
    });
    await this.screenshotRequestService.releaseUserRequest(request, payload, traceCarrier);
  }

  @Span()
  async releaseUserRequestCompensation(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'releaseUserRequestCompensation',
    });
    await this.screenshotRequestService.releaseUserRequest(request, payload, traceCarrier);
    // await this.markCompensated(request);
  }

  @Span()
  async takePageCapture(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'takePageCapture',
    });
    await this.screenshotRequestService.takePageCapture(request, payload, traceCarrier);
  }

  @Span()
  async deletePageCapture(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'deletePageCapture',
    });
    await this.screenshotRequestService.deletePageCapture(request, payload, traceCarrier);
    // await this.markCompensated(request);
  }

  @Span()
  async saveMeta(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'saveMeta',
    });
    await this.screenshotRequestService.addScreenshotMeta(request, payload, traceCarrier);
  }

  @Span()
  async sendSuccessNotification(request: ScreenshotRequestDocument, payload, traceCarrier) {
    this.logger.info({
      saga: request?._id,
      msg: 'sendSuccessNotification',
    });
    await this.screenshotRequestService.sendSuccessNotification(request, payload, traceCarrier);
  }
}
