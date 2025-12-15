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
import { UserMovieService } from './user-movie.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { MarkMovieDto, MovieStatus, RateMovieDto } from './DTO/user-movie.dto';

@Controller('user-movies')
@UseGuards(AuthGuard)
export class UserMovieController {
    constructor(private readonly userMovieService: UserMovieService) {}

    /**
     * Mark a movie as WATCHED or PLANNED
     * POST /user-movies/mark
     */
    @Post('mark')
    @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
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
     * DELETE /user-movies/:movieId
     */
    @Delete(':movieId')
    @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
    async removeMovie(
        @Param('movieId', ParseIntPipe) movieId: number,
        @Req() req: Request & { user?: { sub: string; email: string } }
    ) {
        const userId = req.user?.sub!;
        const data = await this.userMovieService.removeMovie({ movieId }, userId);

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
    @Throttle({ default: { limit: 30, ttl: 60000 } })
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
    @Throttle({ default: { limit: 30, ttl: 60000 } })
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
}

