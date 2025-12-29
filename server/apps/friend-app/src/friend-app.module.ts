import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@app/common';
import { RedisModule } from '@app/redis';
import { FriendAppController } from './friend-app.controller';
import { FriendAppService } from './friend-app.service';
import { FriendModule } from './modules/friend/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule,
    RedisModule,
    FriendModule,
  ],
  controllers: [FriendAppController],
  providers: [FriendAppService],
})
export class FriendAppModule {}
