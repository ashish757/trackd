import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisPubSubService } from './redis-pubsub.service';

@Global()
@Module({
  providers: [
    RedisService,
    RedisPubSubService,
    {
      provide: 'RedisService',
      useExisting: RedisService,
    },
  ],
  exports: [RedisService, RedisPubSubService, 'RedisService'],
})
export class RedisModule {}
