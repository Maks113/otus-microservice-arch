import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { PinoLogger } from 'nestjs-pino';
import { SCREENSHOT_REQUEST_SERVICE } from '../../domains/services/constants';
import { PageCaptureCreateEvent } from './dto/PageCaptureCreateEvent';
import { PageCaptureCreateResultEvent } from './dto/PageCaptureCreateResultEvent';
import { PageCaptureDeleteEvent } from './dto/PageCaptureDeleteEvent';
import { PageCaptureDeleteResultEvent } from './dto/PageCaptureDeleteResultEvent';
import { PageCaptureService } from './page-capture.service';

@Controller('screenshot-request')
export class PageCaptureController implements OnModuleInit {
  tracer = trace.getTracer(PageCaptureController.name);

  constructor(
    private readonly logger: PinoLogger,
    private readonly pageCaptureService: PageCaptureService,
    @Inject(SCREENSHOT_REQUEST_SERVICE)
    private readonly screenshotRequestClient: ClientKafka,
  ) {
    this.logger.setContext(PageCaptureController.name);
  }

  async onModuleInit() {
    await this.screenshotRequestClient.connect();
  }

  @EventPattern('page-capture.create')
  async create(@Payload() payload: PageCaptureCreateEvent): Promise<void> {
    this.logger.info({ event: 'page-capture.create', payload });

    const span = trace.getActiveSpan();
    span?.setAttributes({ ...payload });

    try {
      const filePath = await this.tracer.startActiveSpan(
        'Make page capture',
        async (span) => {
          const filePath = await this.pageCaptureService.makePageCapture(
            payload.link,
            payload.requestId,
          );
          span.end();
          return filePath;
        },
      );
      span?.setAttributes({ filePath });

      const hash = await this.tracer.startActiveSpan('Create HMAC hash', async (span) => {
        const hash = await this.pageCaptureService.createHmacStream(filePath);
        span.end();
        return hash;
      });
      span?.setAttributes({ hash });

      const filename = await this.pageCaptureService.uploadFileToStorage(
        filePath,
        {
          hash,
          link: payload.link,
          requestId: payload.requestId,
        },
      );
      span?.setAttributes({ filename });

      this.screenshotRequestClient.emit(
        'page-capture.create.result',
        JSON.stringify(
          new PageCaptureCreateResultEvent(
            payload.requestId,
            payload.link,
            hash,
            filename,
            'created',
          ),
        ),
      );
    } catch (e) {
      if (!(e instanceof Error)) return;
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: e.message,
      });
      span?.addEvent('Exception', {
        'exception.message': e.message,
        'exception.stack': e.stack,
      });
      this.logger.error(e);

      this.screenshotRequestClient.emit(
        'page-capture.create.result',
        JSON.stringify(
          new PageCaptureCreateResultEvent(
            payload.requestId,
            payload.link,
            null,
            '',
            'failed',
            e.message,
          ),
        ),
      );
    } finally {
      const filepath = `/tmp/${payload.requestId}.png`;
      this.pageCaptureService.deleteFile(filepath);
      span?.end();
    }
  }

  @EventPattern('page-capture.delete')
  async delete(@Payload() payload: PageCaptureDeleteEvent): Promise<void> {
    const span = trace.getActiveSpan();
    span?.setAttributes({ ...payload });
    this.logger.info({ event: 'page-capture.delete', payload });

    await this.pageCaptureService.deleteFileFromStorage(payload.imageName);

    this.screenshotRequestClient.emit(
      'page-capture.delete.result',
      JSON.stringify(new PageCaptureDeleteResultEvent(payload.requestId)),
    );
    span?.end();
  }
}
