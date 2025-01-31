import { Logger, PinoLogger } from 'nestjs-pino';
import { ApplicationPlugin } from './types';

export const LoggerPlugin: ApplicationPlugin = (app) => {
  const logger = app.get(Logger);
  app.useLogger(logger);
};