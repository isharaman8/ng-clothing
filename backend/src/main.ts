import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // pipes
  app.useGlobalPipes(new ValidationPipe());

  // envs
  const PORT = configService.get<number>('port') || 3000;

  await app.listen(PORT);
}
bootstrap();
