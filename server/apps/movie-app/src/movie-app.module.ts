import { Module } from '@nestjs/common';
import { MovieAppController } from './movie-app.controller';
import { MovieAppService } from './movie-app.service';
import {MovieModule} from "./modules/movie/movie.module";
import {ConfigModule} from "@nestjs/config";
import { RedisModule } from '@app/redis';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    MovieModule
  ],
  controllers: [MovieAppController],
  providers: [MovieAppService],
})
export class MovieAppModule {}
