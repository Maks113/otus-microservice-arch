import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Inject,
  OnModuleInit,
  Post,
  Res,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { api } from '@opentelemetry/sdk-node';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import {
  CONSUMER_SERVICE,
  NOTIFICATION_SERVICE,
  PAGE_CAPTURE_SERVICE,
} from '../../domains/services/constants';
import { RequestCreateBodyDto } from './dto/requestCreateDto';
import { ScreenshotRequestSagaService } from './screenshot-request.saga.service';
import { ScreenshotRequestService } from './screenshot-request.service';

@Controller('screenshot-request')
export class ScreenshotRequestController implements OnModuleInit {
  constructor(
    private readonly screenshotRequestService: ScreenshotRequestService,
    private readonly screenshotRequestSagaService: ScreenshotRequestSagaService,
    private readonly logger: PinoLogger,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationsClient: ClientKafka,
    @Inject(CONSUMER_SERVICE) private readonly consumerClient: ClientKafka,
    @Inject(PAGE_CAPTURE_SERVICE)
    private readonly pageCaptureClient: ClientKafka,
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
    @Headers('x-auth-email') userEmail: string,
    @Body() body: RequestCreateBodyDto,
    @Res() res: Response,
  ): Promise<void> {
    if (!userEmail) {
      res.status(HttpStatus.UNAUTHORIZED).send();
    }

    const span = api.trace.getActiveSpan();
    span?.updateName(`POST /screenshot-request`);

    const created = await this.screenshotRequestSagaService.startSaga({
      link: body.link,
      userEmail,
    });
    res.status(HttpStatus.CREATED).send(created);
  }

  @Get('')
  async getSelf(
    @Headers('x-auth-email') userEmail: string,
    @Res() res: Response,
  ): Promise<void> {
    const span = api.trace.getActiveSpan();
    span?.updateName(`GET /screenshot-request`);

    if (!userEmail) {
      res.status(HttpStatus.UNAUTHORIZED).send();
    }

    res
      .status(200)
      .send(await this.screenshotRequestService.getForUser(userEmail));
  }
}
