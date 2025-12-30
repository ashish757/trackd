import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule, RateLimitConfig } from '@app/common';
import { RedisModule } from '@app/redis';
import { AuthAppController } from './auth-app.controller';
import { AuthAppService } from './auth-app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limiting with Redis storage for distributed systems
    ThrottlerModule.forRoot([
      {
        ttl: RateLimitConfig.GLOBAL.ttl,
        limit: RateLimitConfig.GLOBAL.limit,
      },
    ]),
    JwtModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [AuthAppController],
  providers: [
    AuthAppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthAppModule {}
