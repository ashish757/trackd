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
     * Get movie details by ID
     * GET /movies/:id
     */
    @Get(':id')
    async getMovieById(@Param('id', ParseIntPipe) id: number) {
        const data = await this.movieService.getMovieById(id);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Movie details',
            data,
        };
    }
}