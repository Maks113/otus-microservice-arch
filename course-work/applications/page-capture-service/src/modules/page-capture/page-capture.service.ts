import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { PinoLogger } from 'nestjs-pino';
import { createHmac } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PageCaptureService implements OnModuleInit, OnModuleDestroy {
  minioClient: Client;
  browser: Browser;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PageCaptureService.name);
  }

  async onModuleInit() {
    this.minioClient = new Client({
      endPoint: this.config.get<string>('minio.endpoint')!,
      port: this.config.get<number>('minio.port')!,
      useSSL: false,
      accessKey: this.config.get<string>('minio.accessKey')!,
      secretKey: this.config.get<string>('minio.secretKey')!,
    });
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox'],
      timeout: 100000,
    });
  }

  async onModuleDestroy() {
    await this.browser.close();
  }

  async makePageCapture(link: string, id: string): Promise<string> {
    try {
      this.logger.info({ message: `Make page capture: ${link}`, id });
      const filepath = `/tmp/${id}.png`;
      const page = await this.browser.newPage();
      await page.goto(link, { waitUntil: 'networkidle2' });

      await page.screenshot({ fullPage: true, path: filepath });

      return filepath;
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new Error(`Error creating a capture of the page: ${e.message}`, e);
    }
  }

  deleteFile(filepath: string) {
    this.logger.info({ message: `Delete local file: ${filepath}` });
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  async uploadFileToStorage(filepath: string, meta: Record<string, string>) {
    this.logger.info({ message: `Upload file to s3: ${filepath}`, meta });
    try {
      await this.minioClient.putObject(
        this.config.get<string>('minio.bucket')!,
        path.basename(filepath),
        fs.createReadStream(filepath),
        fs.statSync(filepath).size,
        {
          'Content-Type': 'image/png',
          ...meta,
        },
      );
      return path.basename(filepath);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new Error(`Error sending a capture to the s3: ${e.message}`, e);
    }
  }

  async deleteFileFromStorage(filename: string) {
    this.logger.info({ message: `Delete file from s3: ${filename}` });
    await this.minioClient.removeObject(
      this.config.get<string>('minio.bucket')!,
      filename,
    );
  }

  async createHmacStream(filePath: string, algorithm = 'sha256'): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const hmac = createHmac(algorithm, '');
        const stream = fs.createReadStream(filePath);

        stream.on('error', (error) =>
          reject(new Error(`File read error: ${error.message}`)),
        );
        stream.on('data', (chunk) => hmac.update(chunk));
        stream.on('end', () => resolve(hmac.digest('hex')));
      } catch (e) {
        if (!(e instanceof Error)) reject(new Error(e));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        reject(new Error(`Error creating a hash of the page: ${e.message}`, e));
      }
    });
  }
}
