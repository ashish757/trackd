import {Module} from '@nestjs/common';
import FriendService from './friend.service';
import FriendController from './friend.controller';
import {PrismaModule} from "@app/common/prisma/prisma.module";
import {JwtService} from "../auth/jwt.service";

@Module({
    imports: [PrismaModule],
    controllers: [FriendController],
    providers: [FriendService, JwtService],
})

export class FriendModule {}