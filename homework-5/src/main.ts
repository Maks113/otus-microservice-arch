import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  console.log('App running on:', `http://localhost:${port}`);
  await app.listen(port);
}
bootstrap().then();
