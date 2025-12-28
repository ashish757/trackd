import { apiSlice } from '../apiSlice';
import { API_CONFIG } from '../../config/api.config';

export interface Genre {
    id: number;
    name: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

export interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    overview: string;
    vote_average: number;
    vote_count?: number;
    runtime?: number;
    genres?: Genre[];
    tagline?: string;
    budget?: number;
    revenue?: number;
    status?: string;
    original_language?: string;
    spoken_languages?: { iso_639_1: string; name: string; }[];
    production_companies?: { id: number; name: string; logo_path: string | null; }[];
    credits?: Credits;
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
                url: `${API_CONFIG.ENDPOINTS.MOVIE.SEARCH}?query=${encodeURIComponent(searchQuery)}`,
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
                url: API_CONFIG.ENDPOINTS.MOVIE.TRENDING,
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
        getMovieById: builder.query<Movie, number>({
            query: (movieId) => ({
                url: `${API_CONFIG.ENDPOINTS.MOVIE.GET_BY_ID}/${movieId}`,
                method: 'GET',
            }),
            // Transform the response
            transformResponse: (response: { data?: Movie }) => {
                if (response?.data) {
                    return response.data;
                }
                return response as Movie;
            },
        }),
    }),
});

export const { useLazySearchMoviesQuery, useGetTrendingMoviesQuery, useGetMovieByIdQuery } = movieApi;

