import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/common';
import FriendController from './friend.controller';
import FriendService from './friend.service';

@Module({
  imports: [PrismaModule],
  controllers: [FriendController],
  providers: [FriendService],
})

export class FriendModule {}