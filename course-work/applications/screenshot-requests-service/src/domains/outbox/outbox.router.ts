import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  CONSUMER_SERVICE,
  NOTIFICATION_SERVICE,
  PAGE_CAPTURE_SERVICE,
  SCREENSHOT_META_SERVICE,
} from '../services/constants';
import { OutboxDocument } from './schemas/outbox';

@Injectable()
export class OutboxEventsRouter {
  constructor(
    @Inject(NOTIFICATION_SERVICE) private readonly notificationsClient: ClientKafka,
    @Inject(CONSUMER_SERVICE) private readonly consumerClient: ClientKafka,
    @Inject(PAGE_CAPTURE_SERVICE) private readonly pageCaptureClient: ClientKafka,
    @Inject(SCREENSHOT_META_SERVICE) private readonly screenshotMetaClient: ClientKafka,
  ) {}

  private eventsRouter: Record<string, ClientKafka> = {
    'notification.send': this.notificationsClient,
    'consumer.keep': this.consumerClient,
    'consumer.release': this.consumerClient,
    'page-capture.create': this.pageCaptureClient,
    'page-capture.delete': this.pageCaptureClient,
    'screenshot-meta.create': this.screenshotMetaClient,
    'screenshot-meta.delete': this.screenshotMetaClient,
  };

  public getHandler(event: OutboxDocument): ClientKafka | null {
    return this.eventsRouter[event.topic];
  }
}
