import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { UserMovieModule } from './user-movie.module';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(UserMovieModule);
  const logger = new Logger('UserMovieService');

  app.use(cookieParser());

  const frontendUrl = process.env.ENV === 'production' ? process.env.FRONTEND_URL : process.env.FRONTEND_URL_DEV;

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

  const port = process.env.USER_MOVIE_SERVICE_PORT || 3002;
  await app.listen(port, '0.0.0.0');
  logger.log(`User Movie Service is running on port ${port}`);
}

bootstrap();
