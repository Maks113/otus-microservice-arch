import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { Express } from 'express';
import { Client } from 'minio';
import { Span } from 'nestjs-otel';
import { PinoLogger } from 'nestjs-pino';
import { Response } from 'express';
import { SCREENSHOT_REQUEST_SERVICE } from '../../domains/services/constants';
import { ScreenshotMetaCreateEvent } from './dto/ScreenshotMetaCreateEvent';
import { ScreenshotMetaCreateResultEvent } from './dto/ScreenshotMetaCreateResultEvent';
import { ScreenshotMetaDeleteEvent } from './dto/ScreenshotMetaDeleteEvent';
import { ScreenshotMetaDeleteResultEvent } from './dto/ScreenshotMetaDeleteResultEvent';
import { ScreenshotMetaDocument } from './schemas/screenshot-meta';
import { ScreenshotMetaService } from './screenshot-meta.service';

@Controller('screenshot-meta')
export class ScreenshotMetaController implements OnModuleInit {
  private minioClient: Client;

  constructor(
    private readonly screenshotMetaService: ScreenshotMetaService,
    private readonly logger: PinoLogger,
    private readonly config: ConfigService,
    @Inject(SCREENSHOT_REQUEST_SERVICE)
    private readonly screenshotRequestClient: ClientKafka,
  ) {
    this.logger.setContext(ScreenshotMetaController.name);
  }

  async onModuleInit() {
    await this.screenshotRequestClient.connect();
    this.minioClient = new Client({
      endPoint: this.config.get<string>('minio.endpoint')!,
      port: this.config.get<number>('minio.port')!,
      useSSL: false,
      accessKey: this.config.get<string>('minio.accessKey')!,
      secretKey: this.config.get<string>('minio.secretKey')!,
    });
  }

  @Get(':id')
  @Span('Get screenshot request by id', {})
  async getById(
    @Param('id') id: string,
  ): Promise<ScreenshotMetaDocument | null> {
    return await this.screenshotMetaService.getById(id);
  }

  @Get('file/:filename')
  @Span('Get screenshot request by id', {})
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const stream = await this.minioClient.getObject(
      this.config.get<string>('minio.bucket')!,
      filename,
    );
    stream.pipe(res);
  }

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  @Span('Validate screenshot', {})
  async validate(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ScreenshotMetaDocument | null> {
    this.logger.info({ msg: 'Validate screenshot', file });
    const hash = await this.screenshotMetaService.createHmacStream(file.buffer);
    return await this.screenshotMetaService.findIdByHash(hash);
  }

  @EventPattern('screenshot-meta.create')
  async screenshotMetaCreate(
    @Payload() payload: ScreenshotMetaCreateEvent,
  ): Promise<void> {
    this.logger.info({ event: 'page-capture.create', payload });
    const span = trace.getActiveSpan();
    span?.setAttributes({ ...payload });

    let result: ScreenshotMetaDocument | null = null;

    let error: string | null = null;
    try {
      result = await this.screenshotMetaService.create(payload);
    } catch (e) {
      if (e instanceof Error) {
        error = e?.message ?? 'unknown error';
        span?.setStatus({
          code: SpanStatusCode.ERROR,
          message: e.message,
        });
      }
    } finally {
      this.screenshotRequestClient.emit(
        'screenshot-meta.create.result',
        JSON.stringify(
          new ScreenshotMetaCreateResultEvent(
            payload.requestId,
            result?._id?.toString() ?? null,
            error,
          ),
        ),
      );
    }
  }

  @EventPattern('screenshot-meta.delete')
  async screenshotMetaDelete(
    @Payload() payload: ScreenshotMetaDeleteEvent,
  ): Promise<void> {
    this.logger.info({ event: 'page-capture.delete', payload });
    const span = trace.getActiveSpan();
    span?.setAttributes({ ...payload });

    await this.screenshotMetaService.delete(payload);

    this.screenshotRequestClient.emit(
      'screenshot-meta.delete.result',
      JSON.stringify(new ScreenshotMetaDeleteResultEvent(payload.requestId)),
    );
  }
}
