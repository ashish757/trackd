import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule, RateLimitConfig } from '@app/common';
import { RedisModule } from '@app/redis';
import { MovieAppController } from './movie-app.controller';
import { MovieAppService } from './movie-app.service';
import { MovieModule } from './modules/movie/movie.module';

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
  controllers: [MovieAppController],
  providers: [
    MovieAppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class MovieAppModule {}
