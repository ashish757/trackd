import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MovieAppModule } from './movie-app.module';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor } from '@app/common';

// import * as dotenv from 'dotenv';
// import * as path from 'path';
// Load movie-app specific .env file
// When running from dist/apps/movie-app/main.js, we need to go to apps/movie-app/.env
// __dirname will be dist/apps/movie-app, so we go ../../../apps/movie-app/.env
// dotenv.config({ path: path.join(__dirname, '../../../apps/movie-app/.env') });

async function bootstrap() {
  const app = await NestFactory.create(MovieAppModule);
  const logger = new Logger('MovieService');
  app.use(cookieParser());

  // Enable global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  const frontendUrl = process.env.ENV === 'production'
    ? process.env.FRONTEND_URL
    : process.env.FRONTEND_URL_DEV;
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'], // Frontend and main server
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
  );
  const port = process.env.MOVIE_SERVICE_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Movie Service is running on port ${port}`);
}
bootstrap();
