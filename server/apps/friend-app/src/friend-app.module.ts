import { Module } from '@nestjs/common';
import { FriendAppController } from './friend-app.controller';
import { FriendAppService } from './friend-app.service';
import {ConfigModule} from "@nestjs/config";
import {FriendModule} from "./modules/friend/friend.module";
import { RedisModule } from '@app/redis';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      RedisModule,
      FriendModule
  ],
  controllers: [FriendAppController],
  providers: [FriendAppService],
})
export class FriendAppModule {}
