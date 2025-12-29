import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import {JwtService, PrismaModule} from "@app/common";
import {UserController} from "./user.controller";
import { NotificationModule } from '../../../../notification-app/src/modules/notification/notification.module';
import { RedisModule } from '@app/redis';

@Module({
    imports: [PrismaModule, NotificationModule, RedisModule],
    controllers: [UserController, UsersController],
    providers: [UserService, JwtService],
})

export class UserModule {}