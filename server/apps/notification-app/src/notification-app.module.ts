import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@app/common';
import { RedisModule } from '@app/redis';
import { NotificationAppController } from './notification-app.controller';
import { NotificationAppService } from './notification-app.service';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule,
    RedisModule,
    NotificationModule,
  ],
  controllers: [NotificationAppController],
  providers: [NotificationAppService],
})
export class NotificationAppModule {}
