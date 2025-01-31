import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { PinoLogger } from 'nestjs-pino';
import { SCREENSHOT_REQUEST_SERVICE } from '../../domains/services/constants';
import { PageCaptureCreateEvent } from './dto/PageCaptureCreateEvent';
import { PageCaptureCreateResultEvent } from './dto/PageCaptureCreateResultEvent';
import { PageCaptureDeleteEvent } from './dto/PageCaptureDeleteEvent';
import { PageCaptureDeleteResultEvent } from './dto/PageCaptureDeleteResultEvent';
import { PageCaptureService } from './page-capture.service';

@Controller('screenshot-request')
export class PageCaptureController implements OnModuleInit {
  constructor(
    private readonly logger: PinoLogger,
    private readonly pageCaptureService: PageCaptureService,
    @Inject(SCREENSHOT_REQUEST_SERVICE) private readonly screenshotRequestClient: ClientKafka,
  ) {
    this.logger.setContext(PageCaptureController.name);
  }

  async onModuleInit() {
    await this.screenshotRequestClient.connect();
  }

  @EventPattern('page-capture.create')
  async create(@Payload() payload: PageCaptureCreateEvent): Promise<void> {
    this.logger.info({ event: 'page-capture.create', payload });
    try {
      const filePath = await this.pageCaptureService.makePageCapture(payload.link, payload.requestId);
      const hash = await this.pageCaptureService.createHmacStream(filePath);
      const filename = await this.pageCaptureService.uploadFileToStorage(filePath, { hash });

      this.screenshotRequestClient.emit(
        'page-capture.create.result',
        JSON.stringify(new PageCaptureCreateResultEvent(payload.requestId, payload.link, hash, filename, 'created')),
      );
    } catch (e) {
      this.logger.error(e);
      this.screenshotRequestClient.emit(
        'page-capture.create.result',
        JSON.stringify(
          new PageCaptureCreateResultEvent(payload.requestId, payload.link, null, 'failed', e?.message)
        ),
      );
    } finally {
      const filepath = `/tmp/${payload.requestId}.png`;
      this.pageCaptureService.deleteFile(filepath);
    }
  }

  @EventPattern('page-capture.delete')
  async delete(@Payload() payload: PageCaptureDeleteEvent): Promise<void> {
    this.logger.info({ event: 'page-capture.delete', payload });

    await this.pageCaptureService.deleteFileFromStorage(payload.imageName);

    this.screenshotRequestClient.emit(
      'page-capture.delete.result',
      JSON.stringify(new PageCaptureDeleteResultEvent(payload.requestId)),
    );
  }

}
