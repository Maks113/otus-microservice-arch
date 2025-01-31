import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import { ScreenshotMetaCreateEvent } from './dto/ScreenshotMetaCreateEvent';
import { ScreenshotMetaDeleteEvent } from './dto/ScreenshotMetaDeleteEvent';
import { ScreenshotMeta, ScreenshotMetaDocument } from './schemas/screenshot-meta';

@Injectable()
export class ScreenshotMetaService {
  constructor(
    @InjectModel(ScreenshotMeta.name) private screenshotMetaModel: Model<ScreenshotMeta>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ScreenshotMetaService.name);
  }

  async create(event: ScreenshotMetaCreateEvent): Promise<ScreenshotMetaDocument | null> {
    try {
      return await this.screenshotMetaModel.create({
        link: event.link,
        requestId: event.requestId,
        filename: event.filename,
        hash: event.hash,
      });
    } catch (e) {
      this.logger.error(e)
      throw e;
    }
  }

  async delete(event: ScreenshotMetaDeleteEvent): Promise<DeleteResult> {
    try {
      return await this.screenshotMetaModel.deleteOne({
        link: event.link,
        requestId: event.requestId,
      }).exec();
    } catch (e) {
      this.logger.error(e)
      throw e;
    }
  }

  async getById(id: string): Promise<ScreenshotMetaDocument | null> {
    try {
      return await this.screenshotMetaModel.findById(id).exec();
    } catch (e) {
      this.logger.error(e)
      throw e;
    }
  }

  async findIdByHash(hash: string): Promise<ScreenshotMetaDocument | null> {
    try {
      return await this.screenshotMetaModel.findOne({ hash }).exec();
    } catch (e) {
      this.logger.error(e)
      throw e;
    }
  }

  async createHmacStream(filePath: string, algorithm = 'sha256'): Promise<string> {
    return new Promise((resolve, reject) => {
      const hmac = createHmac(algorithm, '');
      const stream = fs.createReadStream(filePath);

      stream.on('error', (error) => reject(new Error(`File read error: ${error.message}`)));
      stream.on('data', (chunk) => hmac.update(chunk));
      stream.on('end', () => resolve(hmac.digest('hex')));
    });
  }
}
