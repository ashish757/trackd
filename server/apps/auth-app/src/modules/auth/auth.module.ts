import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule, AuthGuard, EmailModule, JwtService } from '@app/common';
import { RedisModule } from '@app/redis';

@Module({
    imports: [PrismaModule, EmailModule, RedisModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService, AuthGuard],
    exports: [JwtService, AuthGuard], // Export so other modules can use them
})
export class AuthModule {}
