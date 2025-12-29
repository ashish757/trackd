import { Injectable } from '@nestjs/common';
import { fetchFromTmdb } from '../../config/tmdb.config';
import {RedisService} from "@app/redis";
import {CustomLoggerService} from "@app/common";

@Injectable()
class MovieService {
    private readonly logger : CustomLoggerService

    constructor(private readonly redisService: RedisService) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(MovieService.name);
    }
    /**
     * Get trending movies from TMDB
     */
    async getTrending() {
        const cacheKey = 'trending:movies';
        const cacheTtl = 60*20; // 20 min

        const cachedData:{results: Array<any>} = await this.redisService.get(cacheKey);
        if (cachedData) {
            this.logger.log(`CACHE HIT: ${cachedData.results.length} Trending Movie`);
            return cachedData; // Return immediately if hit
        }
        // cache miss
        this.logger.log(`CACHE MISS: Fetching Trending Movie`);

        const res = await fetchFromTmdb('trending/movie/day?language=en-US');
        if (res.error) return null;

        await this.redisService.set(cacheKey, res.data, cacheTtl);

        return res.data;
    }

    /**
     * Search for movies on TMDB
     */
    async searchMovies(query: string) {
        const res = await fetchFromTmdb(
            `search/movie?query=${encodeURIComponent(query)}&include_adult=true&language=en-US&page=1`
        );
        if (res.error) return null;
        return res.data;
    }

    /**
     * Get movie details by ID from TMDB with credits (cast and crew)
     */
    async getMovieById(id: number) {
        const res = await fetchFromTmdb(`movie/${id}?language=en-US&append_to_response=credits`);
        if (res.error) return null;
        return res.data;
    }
}

export default MovieService;
