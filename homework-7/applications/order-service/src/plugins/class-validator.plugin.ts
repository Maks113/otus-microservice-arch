import { ValidationPipe } from '@nestjs/common';
import { ApplicationPlugin } from './types';

export const ClassValidatorPlugin: ApplicationPlugin = (app) => {
  app.useGlobalPipes(new ValidationPipe());
}