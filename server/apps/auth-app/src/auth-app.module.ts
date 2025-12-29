import { Module } from '@nestjs/common';
import { AuthAppController } from './auth-app.controller';
import { AuthAppService } from './auth-app.service';
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "./modules/auth/auth.module";
import { RedisModule } from '@app/redis';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      RedisModule,
      AuthModule
  ],
  controllers: [AuthAppController],
  providers: [AuthAppService],
})
export class AuthAppModule {}
