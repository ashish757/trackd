import { Module } from '@nestjs/common';
import { FriendAppController } from './friend-app.controller';
import { FriendAppService } from './friend-app.service';
import {ConfigModule} from "@nestjs/config";
import {PrismaModule} from "@app/common";

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      PrismaModule
  ],
  controllers: [FriendAppController],
  providers: [FriendAppService],
})
export class FriendAppModule {}
