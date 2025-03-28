import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ClassValidatorPlugin } from './plugins/class-validator.plugin';
import { LoggerPlugin } from './plugins/logger.plugin';
import { SwaggerPlugin } from './plugins/swagger.plugin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  [
    LoggerPlugin,
    ClassValidatorPlugin,
    SwaggerPlugin,
  ].forEach((plugin) => plugin(app));

  const port = process.env.PORT ?? 3000;
  console.log('App running on:', `http://localhost:${port}`);
  await app.listen(port);
}
bootstrap().then();