import { Module } from '@nestjs/common';
import { NotificationAppController } from './notification-app.controller';
import { NotificationAppService } from './notification-app.service';
import {ConfigModule} from "@nestjs/config";
import {NotificationModule} from "./modules/notification/notification.module";

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      NotificationModule
  ],
  controllers: [NotificationAppController],
  providers: [NotificationAppService],
})
export class NotificationAppModule {}
