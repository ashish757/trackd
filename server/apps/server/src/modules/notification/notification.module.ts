import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '@app/common/prisma/prisma.module';
import { JwtService } from '@app/common/jwt/jwt.service';

@Module({
    imports: [PrismaModule],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway, JwtService],
    exports: [NotificationService, NotificationGateway], // Export to use in other modules
})
export class NotificationModule {}

