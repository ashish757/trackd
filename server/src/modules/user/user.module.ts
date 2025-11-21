import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import {JwtService} from "../auth/jwt.service";
import {PrismaModule} from "../prisma/prisma.module";
import {UserController} from "./user.controller";

@Module({
    imports: [PrismaModule],
    controllers: [UserController, UsersController],
    providers: [UserService, JwtService],
})

export class UserModule {}