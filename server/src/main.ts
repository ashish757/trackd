import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
dotenv.config();
import {AllExceptionsFilter} from "./comman/filters/AllExceptionsFilter";
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: process.env.ENV == 'development'  ? 'http://localhost:5173' : "http://localhost:5173", // your frontend
        credentials: true,               // if using cookies / auth headers
    });

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
