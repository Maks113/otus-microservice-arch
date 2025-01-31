import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { NotificationEvent } from './dto/notificationEvent';

@Controller()
export class NotificationsController {
  constructor(
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(NotificationsController.name);
  }

  @EventPattern('notification.send')
  sendNotification(@Payload() payload: NotificationEvent): void {
    this.logger.info({
      event: 'notification.send',
      payload,
    });
  }


}
