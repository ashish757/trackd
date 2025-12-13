import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MovieModule } from './modules/movie/movie.module';
import { UserMovieModule } from './modules/user-movie/user-movie.module';
import { FriendModule } from "./modules/friend/friend.module";
import { UserModule } from "./modules/user/user.module";
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // Global rate limiting: 20 requests per 60 seconds (1 minute)
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // Time window in milliseconds (60 seconds)
                limit: 20,  // Maximum requests per window
            },
        ]),
        AuthModule,
        MovieModule,
        FriendModule,
        UserMovieModule,
        UserModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Apply throttler guard globally to all routes
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
