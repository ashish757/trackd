import {Module} from '@nestjs/common';
import FriendService from './friend.service';
import FriendController from './friend.controller';
import {PrismaModule, JwtService} from "@app/common";
import { RedisModule } from '@app/redis';

@Module({
    imports: [PrismaModule, RedisModule],
    controllers: [FriendController],
    providers: [FriendService, JwtService],
})

export class FriendModule {}