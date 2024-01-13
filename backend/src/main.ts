// third party imports
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

// inner imports
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // pipes
  app.useGlobalPipes(new ValidationPipe());

  // envs
  const PORT = Number(configService.get<number>('port')) || 3000;

  await app.listen(PORT);
}
bootstrap();
