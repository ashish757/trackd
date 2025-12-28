import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { UserMovieService } from './movie.service';
import { PrismaModule, JwtService } from '@app/common';

@Module({
    imports: [PrismaModule],
    controllers: [MovieController],
    providers: [UserMovieService, JwtService],
})
export class MovieModule {}

