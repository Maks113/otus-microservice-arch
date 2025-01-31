import { Body, Controller, Get, Headers, HttpStatus, Inject, OnModuleInit, Post, Res } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { CONSUMER_SERVICE, NOTIFICATION_SERVICE, PAGE_CAPTURE_SERVICE } from '../../domains/services/constants';
import { RequestCreateDto } from './dto/requestCreateDto';
import { ScreenshotRequestDocument } from './schemas/screenshot-request';
import { ScreenshotRequestSagaService } from './screenshot-request.saga.service';
import { ScreenshotRequestService } from './screenshot-request.service';

@Controller('screenshot-request')
export class ScreenshotRequestController implements OnModuleInit {
  constructor(
    private readonly screenshotRequestService: ScreenshotRequestService,
    private readonly screenshotRequestSagaService: ScreenshotRequestSagaService,
    private readonly logger: PinoLogger,
    @Inject(NOTIFICATION_SERVICE) private readonly notificationsClient: ClientKafka,
    @Inject(CONSUMER_SERVICE) private readonly consumerClient: ClientKafka,
    @Inject(PAGE_CAPTURE_SERVICE) private readonly pageCaptureClient: ClientKafka,
  ) {
    this.logger.setContext(ScreenshotRequestController.name);
  }

  async onModuleInit() {
    await this.notificationsClient.connect();
    await this.consumerClient.connect();
    await this.pageCaptureClient.connect();
  }

  @Post('')
  async createRequest(
    @Res() res: Response,
    @Body() body: RequestCreateDto,
  ): Promise<void> {
    const created = await this.screenshotRequestSagaService.startSaga(body);
    res.status(HttpStatus.CREATED).send(created);
  }

  @Get('')
  async getSelf(
    @Headers('x-user-email') userEmail: string,
  ): Promise<ScreenshotRequestDocument[]> {
    return this.screenshotRequestService.getForUser(userEmail);
  }
}
