import { Module } from '@nestjs/common';
import { UserMovieController } from './user-movie.controller';
import { UserMovieService } from './user-movie.service';
import {ConfigModule} from "@nestjs/config";
import {MovieModule} from "./modules/user-movie/movie.module";
import {PrismaModule} from "@app/common";

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      PrismaModule,
      MovieModule,
  ],
  controllers: [UserMovieController],
  providers: [UserMovieService],
})
export class UserMovieModule {}
