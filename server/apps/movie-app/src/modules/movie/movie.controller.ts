import { Controller, Get, Query, Param, HttpStatus, ParseIntPipe } from '@nestjs/common';
import MovieService from './movie.services';

@Controller()
export class MovieController {
    constructor(private readonly movieService: MovieService) {}

    /**
     * Search for movies
     * GET /movies/search?query=inception
     */
    @Get('search')
    async searchMovies(@Query('query') query: string) {
        const data = await this.movieService.searchMovies(query);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Movie search results',
            data,
        };
    }

    /**
     * Get trending movies
     * GET /movies/trending
     */
    @Get('trending')
    async getTrendingMovies() {
        const data = await this.movieService.getTrending();

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Trending movies',
            data,
        };
    }

    /**
     * Get TV show season details with episodes
     * GET /movies/:tvId/season/:seasonNumber
     */
    @Get(':tvId/season/:seasonNumber')
    async getSeasonDetails(
        @Param('tvId', ParseIntPipe) tvId: number,
        @Param('seasonNumber', ParseIntPipe) seasonNumber: number
    ) {
        const data = await this.movieService.getSeasonDetails(tvId, seasonNumber);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Season details',
            data,
        };
    }

    /**
     * Get movie or TV show details by ID
     * GET /movies/:id?mediaType=tv
     */
    @Get(':id')
    async getMovieById(
        @Param('id', ParseIntPipe) id: number,
        @Query('mediaType') mediaType?: 'movie' | 'tv'
    ) {
        const data = await this.movieService.getMovieById(id, mediaType || 'movie');

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: mediaType === 'tv' ? 'TV show details' : 'Movie details',
            data,
        };
    }
}