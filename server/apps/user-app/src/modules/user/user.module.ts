import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/common';
import { NotificationModule } from '../../../../notification-app/src/modules/notification/notification.module';
import { UserController } from './user.controller';
import { UsersController } from './users.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [UserController, UsersController],
  providers: [UserService],
})

export class UserModule {}