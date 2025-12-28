import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import {JwtService, PrismaModule} from "@app/common";
import {UserController} from "./user.controller";
import { NotificationModule } from '../../../../notification-app/src/modules/notification/notification.module';

@Module({
    imports: [PrismaModule, NotificationModule],
    controllers: [UserController, UsersController],
    providers: [UserService, JwtService],
})

export class UserModule {}