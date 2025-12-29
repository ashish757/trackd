import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FriendAppModule } from './friend-app.module';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor, CustomLoggerService } from '@app/common';


async function bootstrap() {
  const app = await NestFactory.create(FriendAppModule);
  const logger = new CustomLoggerService();
  logger.setContext('FriendService');

  app.use(cookieParser());

  // Enable global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

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

  const port = process.env.FRIEND_SERVICE_PORT || 3006;
  await app.listen(port, '0.0.0.0');
  logger.log(`Friend Service is running on port ${port}`);
}

bootstrap();
