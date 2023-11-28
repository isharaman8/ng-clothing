import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // envs
  const PORT = configService.get<number>('port') || 3000;

  await app.listen(PORT);
}
bootstrap();
