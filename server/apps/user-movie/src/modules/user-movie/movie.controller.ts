import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Query,
    Param,
    HttpStatus,
    Req,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { UserMovieService } from './movie.service';
import { AuthGuard } from '@app/common/guards/auth.guard';
import { RateLimitConfig } from '@app/common';
import {MarkMovieDto, MovieStatus, RateMovieDto, UnmarkMovieDto} from './DTO/user-movie.dto';

@Controller()
@UseGuards(AuthGuard)
export class MovieController {
    constructor(private readonly userMovieService: UserMovieService) {}

    /**
     * Mark a movie as WATCHED or PLANNED
     * POST /user-movies/mark
     */
    @Post('mark')
    @Throttle({ default: RateLimitConfig.MODERATE.ADD_REMOVE_MOVIE })
    async markMovie(
        @Body() dto: MarkMovieDto,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.markMovie(dto, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: `Movie marked as ${dto.status.toLowerCase()}`,
            data,
        };
    }

    /**
     * Remove a movie entry
     * DELETE /user-movies/unmark
     */
    @Post('unmark')
    @Throttle({ default: RateLimitConfig.MODERATE.ADD_REMOVE_MOVIE })
    async removeMovie(
      @Body() dto: UnmarkMovieDto,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.unmarkMovie(dto, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Movie entry removed',
            data,
        };
    }

    /**
     * Get all user movies
     * GET /user-movies
     */
    @Get()
    @Throttle({ default: RateLimitConfig.RELAXED.GET_MOVIES })
    async getUserMovies(@Req() req: Request & { user?: { sub: string; email: string } }) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.getUserMovies(userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'User movies fetched successfully',
            data,
        };
    }

    /**
     * Get movies by status
     * GET /user-movies/by-status?status=WATCHED
     */
    @Get('by-status')
    @Throttle({ default: RateLimitConfig.RELAXED.GET_MOVIES })
    async getUserMoviesByStatus(
        @Query('status') status: MovieStatus,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.getUserMoviesByStatus(userId, status);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: `${status} movies fetched successfully`,
            data,
        };
    }

    /**
     * Get a specific movie entry
     * GET /user-movies/movie/:movieId
     */
    @Get('movie/:movieId')
    @Throttle({ default: RateLimitConfig.RELAXED.GET_MOVIES })
    async getMovieEntry(
        @Param('movieId', ParseIntPipe) movieId: number,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.getMovieEntry(userId, movieId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Movie entry fetched successfully',
            data,
        };
    }

    /**
     * Get user stats
     * GET /user-movies/stats
     */
    @Get('stats')
    @Throttle({ default: RateLimitConfig.RELAXED.GET_MOVIES })
    async getUserStats(@Req() req: Request & { user?: { sub: string; email: string } }) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.getUserStats(userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'User stats fetched successfully',
            data,
        };
    }

    /**
     * Rate a movie
     * POST /user-movies/rate
     */
    @Post('rate')
    @Throttle({ default: RateLimitConfig.MODERATE.RATE_MOVIE })
    async rateMovie(
        @Body() dto: RateMovieDto,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.rateMovie(dto, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Movie rated successfully',
            data,
        };
    }

    /**
     * Get user's rating for a movie
     * GET /user-movies/rating/:movieId
     */
    @Get('rating/:movieId')
    @Throttle({ default: RateLimitConfig.RELAXED.GET_MOVIES })
    async getUserMovieRating(
        @Param('movieId', ParseIntPipe) movieId: number,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.getUserMovieRating(userId, movieId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: data ? 'Rating fetched successfully' : 'No rating found',
            data,
        };
    }

    /**
     * Remove rating
     * DELETE /user-movies/rating/:movieId
     */
    @Delete('rating/:movieId')
    @Throttle({ default: RateLimitConfig.MODERATE.RATE_MOVIE })
    async removeRating(
        @Param('movieId', ParseIntPipe) movieId: number,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.removeRating(movieId, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Rating removed successfully',
            data,
        };
    }

    /**
     * Toggle movie as favorite
     * POST /user-movies/favorite/:movieId
     */
    @Post('favorite/:movieId')
    @Throttle({ default: RateLimitConfig.MODERATE.ADD_REMOVE_MOVIE })
    async toggleFavorite(
        @Param('movieId', ParseIntPipe) movieId: number,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.toggleFavorite(movieId, userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: data.isFavorite ? 'Movie added to favorites' : 'Movie removed from favorites',
            data,
        };
    }

    /**
     * Get user's favorite movies
     * GET /user-movies/favorites
     */
    @Get('favorites')
    @Throttle({ default: RateLimitConfig.RELAXED.GET_MOVIES })
    async getFavoriteMovies(@Req() req: Request & { user?: { sub: string; email: string } }) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.getFavoriteMovies(userId);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Favorite movies fetched successfully',
            data,
        };
    }
}
