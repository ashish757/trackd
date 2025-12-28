import { Module } from '@nestjs/common';
import { AuthAppController } from './auth-app.controller';
import { AuthAppService } from './auth-app.service';
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "./modules/auth/auth.module";

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      AuthModule
  ],
  controllers: [AuthAppController],
  providers: [AuthAppService],
})
export class AuthAppModule {}
