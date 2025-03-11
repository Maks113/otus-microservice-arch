import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { SpanStatusCode, trace, Tracer } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { PinoLogger } from 'nestjs-pino';
import { SCREENSHOT_REQUEST_SERVICE } from '../../domains/services/constants';
import { ConsumerService } from './consumer.service';
import { ConsumerKeepEvent } from './dto/ConsumerKeepEvent';
import { ConsumerKeepResultEvent } from './dto/ConsumerKeepResultEvent';
import { ConsumerReleaseEvent } from './dto/ConsumerReleaseEvent';
import { ConsumerReleaseResultEvent } from './dto/ConsumerReleaseResultEvent';

@Controller()
export class ConsumerHandler implements OnModuleInit {
  tracer: Tracer;

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly logger: PinoLogger,
    @Inject(SCREENSHOT_REQUEST_SERVICE)
    private readonly screenshotRequestClient: ClientKafka,
  ) {
    this.tracer = api.trace.getTracer(ConsumerHandler.name);
    this.logger.setContext(ConsumerHandler.name);
  }

  async onModuleInit(): Promise<void> {
    await this.screenshotRequestClient.connect();
  }

  @EventPattern('consumer.keep')
  async consumerKeep(@Payload() payload: ConsumerKeepEvent): Promise<void> {
    this.logger.info({ event: 'Handle consumer.keep', payload });
    const span = trace.getActiveSpan();
    span?.setAttributes({ ...payload });

    const error = await this.consumerService.keepUserRequest(payload);
    if (error) {
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: error,
      });
    } else {
      span?.setStatus({ code: SpanStatusCode.OK });
    }

    this.screenshotRequestClient.emit(
      'consumer.keep.result',
      JSON.stringify(new ConsumerKeepResultEvent(payload.requestId, error)),
    );
    span?.end();
  }

  @EventPattern('consumer.release')
  async consumer(@Payload() payload: ConsumerReleaseEvent): Promise<void> {
    this.logger.info({ event: 'consumer.release', payload });

    const span = trace.getActiveSpan();
    span?.setAttributes({ ...payload });

    await this.consumerService.releaseUserRequest(payload);
    this.screenshotRequestClient.emit(
      'consumer.release.result',
      JSON.stringify(new ConsumerReleaseResultEvent(payload.requestId)),
    );

    span?.end();
  }
}
