import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import {JwtService} from "../auth/jwt.service";
import {PrismaModule} from "@app/common/prisma/prisma.module";
import {UserController} from "./user.controller";
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [PrismaModule, NotificationModule],
    controllers: [UserController, UsersController],
    providers: [UserService, JwtService],
})

export class UserModule {}