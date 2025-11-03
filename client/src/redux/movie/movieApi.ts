import { apiSlice } from '../apiSlice';

export interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    overview: string;
    vote_average: number;
    media_type?: string;
}

export interface MovieSearchResponse {
    results: Movie[];
    page: number;
    total_pages: number;
    total_results: number;
}

export const movieApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        searchMovies: builder.query<MovieSearchResponse, string>({
            query: (searchQuery) => ({
                url: `/movies/search?query=${encodeURIComponent(searchQuery)}`,
                method: 'GET',
            }),
            // Transform the response to match our interface
            transformResponse: (response: { data?: MovieSearchResponse; results?: Movie[] }) => {
                if (response?.data) {
                    return response.data;
                }
                return response as MovieSearchResponse;
            },
        }),
        getTrendingMovies: builder.query<MovieSearchResponse, void>({
            query: () => ({
                url: '/movies/trending',
                method: 'GET',
            }),
            // Transform the response to match our interface
            transformResponse: (response: { data?: MovieSearchResponse; results?: Movie[] }) => {
                if (response?.data) {
                    return response.data;
                }
                return response as MovieSearchResponse;
            },
        }),
    }),
});

export const { useLazySearchMoviesQuery, useGetTrendingMoviesQuery } = movieApi;

