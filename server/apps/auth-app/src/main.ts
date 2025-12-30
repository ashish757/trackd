import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthAppModule } from './auth-app.module';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor, CustomLoggerService, AllExceptionsFilter, ThrottlerExceptionFilter } from '@app/common';


async function bootstrap() {
  const app = await NestFactory.create(AuthAppModule);
  const logger = new CustomLoggerService();
  logger.setContext('AuthService');

  app.use(cookieParser());

  // Enable global exception filters
  // Order matters: Specific filters first, then general ones
  app.useGlobalFilters(
    new ThrottlerExceptionFilter(), // Handle rate limiting errors with custom response
    new AllExceptionsFilter()        // Handle all other exceptions
  );

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

  const port = process.env.AUTH_SERVICE_PORT || 3003;
  await app.listen(port, '0.0.0.0');
  logger.log(`Auth Service is running on port ${port}`);
}

bootstrap();
