import { Injectable } from '@nestjs/common';
import { fetchFromTmdb } from '../../config/tmdb.config';

@Injectable()
class MovieService {
    /**
     * Get trending movies from TMDB
     */
    async getTrending() {
        const res = await fetchFromTmdb('trending/movie/day?language=en-US');
        if (res.error) return null;
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
     * Get movie details by ID from TMDB
     */
    async getMovieById(id: number) {
        const res = await fetchFromTmdb(`movie/${id}?language=en-US`);
        if (res.error) return null;
        return res.data;
    }
}

export default MovieService;
