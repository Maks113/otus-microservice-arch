import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { ConsumerKeepResultEvent } from '../../domains/screenshot-request/ConsumerKeepResultEvent';
import { ConsumerReleaseResultEvent } from '../../domains/screenshot-request/ConsumerReleaseResultEvent';
import { SCREENSHOT_REQUEST_SERVICE } from '../../domains/services/constants';
import { ConsumerService } from './consumer.service';
import { ConsumerKeepEvent } from './dto/ConsumerKeepEvent';
import { ConsumerReleaseEvent } from './dto/ConsumerReleaseEvent';

@Controller()
export class ConsumerController implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly logger: PinoLogger,
    @Inject(SCREENSHOT_REQUEST_SERVICE) private readonly screenshotRequestClient: ClientKafka,
  ) {
    this.logger.setContext(ConsumerController.name);
  }

  async onModuleInit(): Promise<void> {
    await this.screenshotRequestClient.connect();
  }

  @EventPattern('consumer.keep')
  async consumerKeep(@Payload() payload: ConsumerKeepEvent): Promise<void> {
    this.logger.info({ event: 'consumer.keep', payload });
    const result = await this.consumerService.keepUserRequest(payload);
    this.screenshotRequestClient.emit(
      'consumer.keep.result',
      JSON.stringify(new ConsumerKeepResultEvent(payload.requestId, result)),
      );
  }

  @EventPattern('consumer.release')
  async consumer(@Payload() payload: ConsumerReleaseEvent): Promise<void> {
    this.logger.info({ event: 'consumer.release', payload });
    await this.consumerService.releaseUserRequest(payload)
    this.screenshotRequestClient.emit(
      'consumer.release.result',
      JSON.stringify(new ConsumerReleaseResultEvent(payload.requestId)),
    );
  }
}
