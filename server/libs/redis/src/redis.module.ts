import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'RedisService',
      useExisting: RedisService,
    },
  ],
  exports: [RedisService, 'RedisService'],
})
export class RedisModule {}
