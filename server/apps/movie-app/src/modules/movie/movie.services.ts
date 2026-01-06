import { Injectable } from '@nestjs/common';
import { fetchFromTmdb } from '../../config/tmdb.config';
import {RedisCacheService} from "@app/redis";
import {CustomLoggerService} from "@app/common";

@Injectable()
class MovieService {
    private readonly logger : CustomLoggerService

    constructor(private readonly redisService: RedisCacheService) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(MovieService.name);
    }
    /**
     * Get trending movies and TV shows from TMDB
     */
    async getTrending() {
        const cacheKey = 'trending:all';
        const cacheTtl = 60*20; // 20 min

        const cachedData:{results: Array<any>} = await this.redisService.get(cacheKey);
        if (cachedData) {
            this.logger.log(`CACHE HIT: ${cachedData.results.length} Trending Movies & TV Shows`);
            return cachedData; // Return immediately if hit
        }
        // cache miss
        this.logger.log(`CACHE MISS: Fetching Trending Movies & TV Shows`);

        const res = await fetchFromTmdb('trending/all/day?language=en-US');
        if (res.error) return null;

        // Normalize TV show data to match movie format for frontend compatibility
        const normalizedData = {
            ...res.data,
            results: res.data.results?.map((item: any) => {
                if (item.media_type === 'tv') {
                    return {
                        ...item,
                        title: item.name || item.original_name,
                        release_date: item.first_air_date,
                    };
                }
                return item;
            }) || []
        };

        await this.redisService.set(cacheKey, normalizedData, cacheTtl);

        return normalizedData;
    }

    /**
     * Search for movies and TV shows on TMDB using multi search
     */
    async searchMovies(query: string) {
        const res = await fetchFromTmdb(
            `search/multi?query=${encodeURIComponent(query)}&include_adult=true&language=en-US&page=1`
        );
        if (res.error) return null;

        // Filter to only include movies and TV shows, exclude people
        return {
            ...res.data,
            results: res.data.results?.filter((item: any) =>
                item.media_type === 'movie' || item.media_type === 'tv'
            ).map((item: any) => {
                // Normalize TV show data to match movie format for frontend compatibility
                if (item.media_type === 'tv') {
                    return {
                        ...item,
                        title: item.name || item.original_name, // TV shows use 'name' instead of 'title'
                        release_date: item.first_air_date, // TV shows use 'first_air_date' instead of 'release_date'
                    };
                }
                return item;
            }) || []
        };
    }

    /**
     * Get movie or TV show details by ID from TMDB with credits (cast and crew)
     * Note: This currently assumes movie type. For TV shows, you'll need to pass media_type
     */
    async getMovieById(id: number, mediaType: 'movie' | 'tv' = 'movie') {
        const endpoint = mediaType === 'tv'
            ? `tv/${id}?language=en-US&append_to_response=credits`
            : `movie/${id}?language=en-US&append_to_response=credits`;

        const res = await fetchFromTmdb(endpoint);
        if (res.error) return null;

        // Normalize TV show data to match movie format
        if (mediaType === 'tv' && res.data) {
            return {
                ...res.data,
                title: res.data.name || res.data.original_name,
                release_date: res.data.first_air_date,
                media_type: 'tv'
            };
        }

        return res.data;
    }
}

export default MovieService;
