import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@app/common/jwt/jwt.service';
import { PrismaModule } from '@app/common/prisma/prisma.module';
import { AuthGuard } from '@app/common/guards/auth.guard';
import { EmailModule } from '@app/common';

@Module({
    imports: [PrismaModule, EmailModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService, AuthGuard],
    exports: [JwtService, AuthGuard], // Export so other modules can use them
})
export class AuthModule {}
