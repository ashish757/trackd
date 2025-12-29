import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/common';
import { UserController } from './user.controller';
import { UsersController } from './users.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, UsersController],
  providers: [UserService],
})
export class UserModule {}