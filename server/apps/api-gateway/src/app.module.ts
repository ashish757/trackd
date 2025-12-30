import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitConfig } from '@app/common';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // Global rate limiting for API Gateway
        ThrottlerModule.forRoot([
            {
                ttl: RateLimitConfig.GLOBAL.ttl,
                limit: RateLimitConfig.GLOBAL.limit,
            },
        ])
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
