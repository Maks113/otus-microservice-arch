import { Logger } from 'nestjs-pino';
import { ApplicationPlugin } from './types';

export const LoggerPlugin: ApplicationPlugin = (app) => {
  app.useLogger(app.get(Logger));
};