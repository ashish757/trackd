import { Module } from '@nestjs/common';
import { UserMovieController } from './user-movie.controller';
import { UserMovieService } from './user-movie.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtService } from '../auth/jwt.service';

@Module({
    imports: [PrismaModule],
    controllers: [UserMovieController],
    providers: [UserMovieService, JwtService],
})
export class UserMovieModule {}

