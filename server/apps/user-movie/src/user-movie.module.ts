import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@app/common';
import { RedisModule } from '@app/redis';
import { UserMovieController } from './user-movie.controller';
import { UserMovieService } from './user-movie.service';
import { MovieModule } from './modules/user-movie/movie.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule,
    RedisModule,
    MovieModule,
  ],
  controllers: [UserMovieController],
  providers: [UserMovieService],
})
export class UserMovieModule {}
