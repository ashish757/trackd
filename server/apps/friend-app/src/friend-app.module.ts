import { Module } from '@nestjs/common';
import { FriendAppController } from './friend-app.controller';
import { FriendAppService } from './friend-app.service';
import {ConfigModule} from "@nestjs/config";
import {FriendModule} from "./modules/friend/friend.module";

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      FriendModule
  ],
  controllers: [FriendAppController],
  providers: [FriendAppService],
})
export class FriendAppModule {}
