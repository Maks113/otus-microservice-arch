import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { NotificationEvent } from './dto/notificationEvent';
import { NotificationDocument, Notification } from './schemas/notification.schema';

@Controller()
export class NotificationsController {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(NotificationsController.name);
  }

  @EventPattern('notification.send')
  async sendNotification(@Payload() payload: NotificationEvent): Promise<void> {
    this.logger.info({
      event: 'notification.send',
      payload,
    });
    await this.notificationModel.create(payload);
  }

  @Get('')
  async readList(): Promise<NotificationDocument[]> {
    const notifications: NotificationDocument[] = await this.notificationModel.find().exec();
    this.logger.info({
      method: 'ReadList',
      count: notifications.length,
    })
    return notifications;
  }

}
