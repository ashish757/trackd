import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule, RateLimitConfig } from '@app/common';
import { RedisModule } from '@app/redis';
import { UserMovieController } from './user-movie.controller';
import { UserMovieService } from './user-movie.service';
import { MovieModule } from './modules/user-movie/movie.module';

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
    MovieModule,
  ],
  controllers: [UserMovieController],
  providers: [
    UserMovieService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UserMovieModule {}
