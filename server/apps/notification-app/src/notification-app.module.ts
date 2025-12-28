import { Module } from '@nestjs/common';
import { NotificationAppController } from './notification-app.controller';
import { NotificationAppService } from './notification-app.service';
import {ConfigModule} from "@nestjs/config";
import {PrismaModule} from "@app/common";
import {NotificationModule} from "./modules/notification/notification.module";

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      PrismaModule,
      NotificationModule
  ],
  controllers: [NotificationAppController],
  providers: [NotificationAppService],
})
export class NotificationAppModule {}
