import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MovieModule } from './modules/movie/movie.module';
import { UserMovieModule } from './modules/user-movie/user-movie.module';
import {FriendModule} from "./modules/friend/friend.module";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, MovieModule, FriendModule, UserMovieModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
