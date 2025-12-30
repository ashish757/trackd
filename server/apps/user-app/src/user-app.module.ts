import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule, RateLimitConfig } from '@app/common';
import { RedisModule } from '@app/redis';
import { UserAppController } from './user-app.controller';
import { UserAppService } from './user-app.service';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: RateLimitConfig.GLOBAL.ttl,
        limit: RateLimitConfig.GLOBAL.limit,
      },
    ]),
    JwtModule,
    RedisModule,
    UserModule,
  ],
  controllers: [UserAppController],
  providers: [
    UserAppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UserAppModule {}
