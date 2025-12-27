import { NestFactory } from '@nestjs/core';
import { MovieServiceModule } from './movie-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MovieServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
