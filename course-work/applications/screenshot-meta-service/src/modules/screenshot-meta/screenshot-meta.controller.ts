import { Controller, Get, Inject, OnModuleInit, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { SCREENSHOT_REQUEST_SERVICE } from '../../domains/services/constants';
import { ScreenshotMetaCreateEvent } from './dto/ScreenshotMetaCreateEvent';
import { ScreenshotMetaCreateResultEvent } from './dto/ScreenshotMetaCreateResultEvent';
import { ScreenshotMetaDeleteEvent } from './dto/ScreenshotMetaDeleteEvent';
import { ScreenshotMetaDeleteResultEvent } from './dto/ScreenshotMetaDeleteResultEvent';
import { ScreenshotMetaDocument } from './schemas/screenshot-meta';
import { ScreenshotMetaService } from './screenshot-meta.service';

@Controller('screenshot-request')
export class ScreenshotMetaController implements OnModuleInit {
  constructor(
    private readonly screenshotMetaService: ScreenshotMetaService,
    private readonly logger: PinoLogger,
    @Inject(SCREENSHOT_REQUEST_SERVICE) private readonly screenshotRequestClient: ClientKafka,
  ) {
    this.logger.setContext(ScreenshotMetaController.name);
  }

  async onModuleInit() {
    await this.screenshotRequestClient.connect();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ScreenshotMetaDocument | null> {
    return await this.screenshotMetaService.getById(id);
  }

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async validate(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ScreenshotMetaDocument | null> {
    const hash = await this.screenshotMetaService.createHmacStream(file.path);
    return await this.screenshotMetaService.findIdByHash(hash);
  }

  @EventPattern('screenshot-meta.create')
  async consumerKeep(@Payload() payload: ScreenshotMetaCreateEvent): Promise<void> {
    this.logger.info({ event: 'page-capture.create', payload });
    let error: string | null = null;
    try {
      await this.screenshotMetaService.create(payload);
    } catch (e) {
      error = e?.message ?? 'unknown error';
    } finally {
      this.screenshotRequestClient.emit(
        'screenshot-meta.create.result',
        JSON.stringify(
          new ScreenshotMetaCreateResultEvent(payload.requestId, error),
        ),
      );
    }
  }

  @EventPattern('screenshot-meta.delete')
  async consumer(@Payload() payload: ScreenshotMetaDeleteEvent): Promise<void> {
    this.logger.info({ event: 'page-capture.delete', payload });

    await this.screenshotMetaService.delete(payload);

    this.screenshotRequestClient.emit(
      'screenshot-meta.delete.result',
      JSON.stringify(new ScreenshotMetaDeleteResultEvent(payload.requestId)),
    );
  }

}
