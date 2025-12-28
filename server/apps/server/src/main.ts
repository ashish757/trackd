import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/AllExceptionsFilter';
import { AppModule } from './app.module';
import { validateEnvironmentVariables } from './utils/env-validator';
import { createProxyMiddleware} from "http-proxy-middleware";

async function bootstrap() {
    // Validate environment variables BEFORE creating the app
    validateEnvironmentVariables(true); // Throws error if required vars are missing

    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');


    // Proxy all /movies requests to movie-app microservice
    app.use('/movies', createProxyMiddleware({
        target: 'http://localhost:3001',
        changeOrigin: true,

    }));

    // Enable cookie parser for HttpOnly cookies
    app.use(cookieParser());

    // Enable CORS with credentials
    app.enableCors({
        origin: [
            'https://trackd-ten.vercel.app',
            'http://localhost:5173',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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


    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is up and running on port ${port}`);
}
bootstrap();
