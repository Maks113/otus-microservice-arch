import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import opentelemetry, { Tracer } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { lastValueFrom } from 'rxjs';
import { OutboxEventsRouter } from './outbox.router';
import { Outbox, OutboxDocument } from './schemas/outbox';

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
  intervalId: NodeJS.Timeout;
  tracer: Tracer = opentelemetry.trace.getTracer(OutboxWorker.name);

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
    });
  }

  private startPolling() {
    void this.pollingTick().then();
  }

  private async pollingTick(): Promise<void> {
    await this.handleOutbox();
    this.intervalId = setTimeout(() => void this.pollingTick(), 200);
  }

  async handleOutbox() {
    const pendingEvents = await this.getPendingEvents();
    if (pendingEvents.length > 0) {
      this.logger.info(`Outbox tick: ${pendingEvents.length}`);
    }

    for (const event of pendingEvents) {
      this.logger.info({
        event,
        msg: 'Outbox send event'
      })
      const context = api.propagation.extract(api.context.active(), event.traceCarrier);
      await api.context.with(context, async () => {
        await this.tracer.startActiveSpan('Outbox send event', {
          attributes: {
            'app.outbox.id': event.id as string,
            'app.outbox.topic': event.topic,
            'app.outbox.status': event.status,
            'app.outbox.attempts': event.attempts,
            'app.outbox.payload': JSON.stringify(event.payload)
          },
        }, async (span) => {
          const result = await this.sendEvent(event);
          await this.updateOutboxStatus(event, result);
          span.end();
        });
      });
    }
  }

  async getPendingEvents(): Promise<OutboxDocument[]> {
    return await this.outboxModel
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendEvent(event: OutboxDocument): Promise<boolean> {
    const service = this.outboxEventsRouter.getHandler(event);

    if (!service) {
      this.logger.error({
        message: `Cant process message for topic ${event.topic}. `
          + `Router does not have event handler for this event`,
        event: event,
      });
      return false;
    }

    try {
      const observableResult = service.emit(event.topic, event.payload);
      await lastValueFrom(observableResult); // value or throw exception;
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  private async updateOutboxStatus(event: OutboxDocument, isSuccess: boolean): Promise<void> {
    this.logger.info({ event, isSuccess });
    if (isSuccess) {
      event.status = 'processed';
    } else {
      event.attempts += 1;
    }
    await event.save();
  }
}
