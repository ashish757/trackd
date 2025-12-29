import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@app/common';
import { RedisModule } from '@app/redis';
import { MovieAppController } from './movie-app.controller';
import { MovieAppService } from './movie-app.service';
import { MovieModule } from './modules/movie/movie.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule,
    RedisModule,
    MovieModule,
  ],
  controllers: [MovieAppController],
  providers: [MovieAppService],
})
export class MovieAppModule {}
