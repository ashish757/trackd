import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './comman/filters/AllExceptionsFilter';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable cookie parser for HttpOnly cookies
    app.use(cookieParser());

    // Enable CORS with credentials
    app.enableCors({
        origin: process.env.ENV === 'development'
            ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
            : process.env.FRONTEND_URL || 'https://yourdomain.com',
        credentials: true, // CRITICAL: Allow cookies to be sent
    });

    // Global validation pipe - CRITICAL for DTO validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties that don't have decorators
            forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
            transform: true, // Automatically transform payloads to DTO instances
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Validate required environment variables
    const requiredEnvVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_OTP_SECRET', 'DATABASE_URL'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
