import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { UserMovieService } from './movie.service';
import { PrismaModule } from '@app/common/prisma/prisma.module';
import { JwtService } from '@app/common/jwt/jwt.service';

@Module({
    imports: [PrismaModule],
    controllers: [MovieController],
    providers: [UserMovieService, JwtService],
})
export class MovieModule {}

