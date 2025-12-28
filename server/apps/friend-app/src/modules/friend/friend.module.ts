import {Module} from '@nestjs/common';
import FriendService from './friend.service';
import FriendController from './friend.controller';
import {PrismaModule, JwtService} from "@app/common";

@Module({
    imports: [PrismaModule],
    controllers: [FriendController],
    providers: [FriendService, JwtService],
})

export class FriendModule {}