import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { OutboxEventsRouter } from './outbox.router';
import { Outbox, OutboxDocument } from './schemas/outbox';

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
  intervalId: NodeJS.Timeout;

  constructor(
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    private readonly logger: PinoLogger,
    private readonly outboxEventsRouter: OutboxEventsRouter,
  ) {
    this.logger.setContext(OutboxWorker.name);
  }

  onModuleInit() {
    this.startPolling();
    this.logger.info({
      message: 'Outbox worker initialized',
    });
  }

  onModuleDestroy() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.logger.info({
      message: 'Outbox worker destroyed',
    })
  }

  private startPolling() {
    this.intervalId = setInterval(async () => {
      const pendingEvents = await this.getPendingEvents();
      if (pendingEvents.length > 0) {
        this.logger.info(`Outbox tick: ${pendingEvents.length}`);
      }

      for (let event of pendingEvents) {
        const result = this.sendEvent(event);
        await this.updateOutboxStatus(event, result);
      }
    }, 1_000);
  }

  async getPendingEvents(): Promise<OutboxDocument[]> {
    return await this.outboxModel
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .exec();
  }

  sendEvent(event: OutboxDocument): boolean {
    const service = this.outboxEventsRouter.getHandler(event);

    if (!service) {
      this.logger.error({
        message: `Cant process message for topic ${event.topic}. `
          + `Router does not have event handler for this event`,
        event: event
      });
      return false;
    }

    try {
      service.emit(event.topic, event.payload);
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  private async updateOutboxStatus(event: OutboxDocument, isSuccess: boolean): Promise<void> {
    if (isSuccess) {
      event.status = 'processed';
    } else {
      event.attempts += 1;
    }
    await event.save();
  }
}
