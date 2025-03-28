import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NotificationEvent } from '../notifications/notificationEvent';
import { OrderCreateDto } from './dto/order.create.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly httpService: HttpService,
    @Inject('notifications-service')
    private readonly notificationsClient: ClientKafka,
  ) {}

  async create(orderCreateDto: OrderCreateDto) {
    try {
      const result = await firstValueFrom(
        this.httpService.post(
          `http://billing.arch.homework/account/${orderCreateDto.userId}/withdraw`,
          { value: orderCreateDto.orderPrice },
        ),
      );
      if (result.status < 400) {
        this.sendSuccess(orderCreateDto.orderPrice);
      } else {
        this.sendError(orderCreateDto.orderPrice);
      }
      return;
    } catch (e: unknown) {
      this.sendError(orderCreateDto.orderPrice);
    }
  }

  sendSuccess(price: number) {
    this.notificationsClient.emit(
      'notification.send',
      JSON.stringify(
        new NotificationEvent(
          'user@example.com',
          'Заказ создан',
          `Успешно создан заказ на сумму: ${Math.abs(price)}`,
        ),
      ),
    );
  }

  sendError(price: number) {
    this.notificationsClient.emit(
      'notification.send',
      JSON.stringify(
        new NotificationEvent(
          'user@example.com',
          'Ошибка создания заказа',
          `Ошибка списания по заказу на сумму: ${Math.abs(price)}. Недостаточно средств`,
        ),
      ),
    );
  }
}
