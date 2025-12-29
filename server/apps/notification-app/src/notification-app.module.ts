import { Module } from '@nestjs/common';
import { NotificationAppController } from './notification-app.controller';
import { NotificationAppService } from './notification-app.service';
import {ConfigModule} from "@nestjs/config";
import {NotificationModule} from "./modules/notification/notification.module";
import { RedisModule } from '@app/redis';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      RedisModule,
      NotificationModule
  ],
  controllers: [NotificationAppController],
  providers: [NotificationAppService],
})
export class NotificationAppModule {}
