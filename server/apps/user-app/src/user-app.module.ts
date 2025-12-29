import { Module } from '@nestjs/common';
import { UserAppController } from './user-app.controller';
import { UserAppService } from './user-app.service';
import {ConfigModule} from "@nestjs/config";
import {UserModule} from "./modules/user/user.module";
import { RedisModule } from '@app/redis';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      RedisModule,
      UserModule,
  ],
  controllers: [UserAppController],
  providers: [UserAppService],
})
export class UserAppModule {}
