import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { ConsumerKeepResultEvent } from '../../domains/consumer/events/ConsumerKeepResultEvent';
import { ConsumerReleaseResultEvent } from '../../domains/consumer/events/ConsumerReleaseResultEvent';
import { PageCaptureCreateResultEvent } from '../../domains/page-capture/events/PageCaptureCreateResultEvent';
import { PageCaptureDeleteResultEvent } from '../../domains/page-capture/events/PageCaptureDeleteResultEvent';
import { ScreenshotMetaCreateResultEvent } from '../../domains/screenshot-meta/events/ScreenshotMetaCreateResultEvent';
import { ScreenshotMetaDeleteResultEvent } from '../../domains/screenshot-meta/events/ScreenshotMetaDeleteResultEvent';
import { CONSUMER_SERVICE, PAGE_CAPTURE_SERVICE, SCREENSHOT_META_SERVICE } from '../../domains/services/constants';
import { ScreenshotRequestSagaService } from './screenshot-request.saga.service';

@Controller()
export class ScreenshotRequestHandler implements OnModuleInit {
  constructor(
    private readonly logger: PinoLogger,
    @Inject(CONSUMER_SERVICE) private readonly consumerClient: ClientKafka,
    @Inject(PAGE_CAPTURE_SERVICE) private readonly pageCaptureClient: ClientKafka,
    @Inject(SCREENSHOT_META_SERVICE) private readonly screenshotMetaClient: ClientKafka,
    private readonly screenshotRequestSagaService: ScreenshotRequestSagaService,
  ) {
    this.logger.setContext(ScreenshotRequestHandler.name);
  }

  async onModuleInit() {
    await this.consumerClient.connect();
    await this.pageCaptureClient.connect();
    await this.screenshotMetaClient.connect();
  }

  @EventPattern('consumer.keep.result')
  async consumerKeepResult(@Payload() payload: ConsumerKeepResultEvent): Promise<void> {
    this.logger.info({ event: 'consumer.keep.result', payload });
    if (payload.error) {
      await this.screenshotRequestSagaService.compensate(payload.requestId, payload.error);
    } else {
      await this.screenshotRequestSagaService.nextStep(payload.requestId, payload);
    }
  }

  @EventPattern('consumer.release.result')
  async consumerReleaseResult(@Payload() payload: ConsumerReleaseResultEvent): Promise<void> {
    this.logger.info({ event: 'consumer.release.result', payload });
    await this.screenshotRequestSagaService.nextStep(payload.requestId, payload);
  }

  @EventPattern('page-capture.create.result')
  async pageCaptureCreateResult(@Payload() payload: PageCaptureCreateResultEvent): Promise<void> {
    this.logger.info({ event: 'consumer.keep.result', payload });
    if (payload.error) {
      await this.screenshotRequestSagaService.compensate(payload.requestId, payload.error);
    } else {
      await this.screenshotRequestSagaService.nextStep(payload.requestId, payload);
    }
  }

  @EventPattern('page-capture.delete.result')
  async pageCaptureDeleteResult(@Payload() payload: PageCaptureDeleteResultEvent): Promise<void> {
    this.logger.info({ event: 'page-capture.delete.result', payload });
    await this.screenshotRequestSagaService.nextStep(payload.requestId, payload);
  }

  @EventPattern('screenshot-meta.create.result')
  async screenshotMetaCreateResult(@Payload() payload: ScreenshotMetaCreateResultEvent): Promise<void> {
    this.logger.info({ event: 'screenshot-meta.create.result', payload });
    if (payload.error) {
      await this.screenshotRequestSagaService.compensate(payload.requestId, payload.error);
    } else {
      await this.screenshotRequestSagaService.nextStep(payload.requestId, payload);
    }
  }

  @EventPattern('screenshot-meta.delete.result')
  async screenshotMetaDeleteResult(@Payload() payload: ScreenshotMetaDeleteResultEvent): Promise<void> {
    this.logger.info({ event: 'screenshot-meta.delete.result', payload });
    await this.screenshotRequestSagaService.nextStep(payload.requestId, payload);
  }
}
