import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { PrismaModule, JwtService } from '@app/common';
import { RedisModule } from '@app/redis';

@Module({
    imports: [PrismaModule, RedisModule],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway, JwtService],
    exports: [NotificationService, NotificationGateway], // Export to use in other modules
})
export class NotificationModule {}

