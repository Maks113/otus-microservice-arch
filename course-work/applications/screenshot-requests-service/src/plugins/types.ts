import { INestApplication } from '@nestjs/common';

export interface ApplicationPlugin {
  (app: INestApplication): void;
}