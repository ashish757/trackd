import { Module } from '@nestjs/common';
import { UserAppController } from './user-app.controller';
import { UserAppService } from './user-app.service';
import {ConfigModule} from "@nestjs/config";
import {PrismaModule} from "@app/common";
import {UserModule} from "./modules/user/user.module";

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      PrismaModule,
      UserModule,
  ],
  controllers: [UserAppController],
  providers: [UserAppService],
})
export class UserAppModule {}
