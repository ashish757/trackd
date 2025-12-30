import { Module, Global } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { RedisPubSubService } from './redis-pubsub.service';

@Global()
@Module({
  providers: [
    RedisCacheService,
    RedisPubSubService,
    {
      provide: 'RedisService',
      useExisting: RedisCacheService,
    },
  ],
  exports: [RedisCacheService, RedisPubSubService, 'RedisService'],
})
export class RedisModule {}
