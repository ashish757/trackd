import {Query, Get, HttpStatus} from "@nestjs/common";
import {MovieService} from "./movie.services";
import {Controller} from "@nestjs/common";


@Controller('movies')
export class MovieController {
    constructor(private readonly movieService: MovieService) {}

    @Get('/search')
    async getMovies(@Query('query') query: string) {
        const data = await this.movieService.getMovies(query);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Movie Search',
            data: data,
        }
    }

    @Get('/trending')
    async getTrending() {
        const data = await this.movieService.getTrending();

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Trending Movies',
            data: data,
        }
    }
}