import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApplicationPlugin } from './types';

export const SwaggerPlugin: ApplicationPlugin = (app) => {
  const config = new DocumentBuilder()
    .setTitle('[PageValid] screenshot-meta-service')
    .setDescription('Screenshot meta service')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
};