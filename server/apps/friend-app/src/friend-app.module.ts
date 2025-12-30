import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule, RateLimitConfig } from '@app/common';
import { RedisModule } from '@app/redis';
import { FriendAppController } from './friend-app.controller';
import { FriendAppService } from './friend-app.service';
import { FriendModule } from './modules/friend/friend.module';

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
    FriendModule,
  ],
  controllers: [FriendAppController],
  providers: [
    FriendAppService,
  ],
})
export class FriendAppModule {}
