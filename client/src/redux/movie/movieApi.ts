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

export interface Episode {
    id: number;
    name: string;
    episode_number: number;
    air_date?: string;
    overview?: string;
    still_path?: string | null;
    vote_average?: number;
    vote_count?: number;
    runtime?: number;
}

export interface Season {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    air_date?: string;
    poster_path?: string | null;
    overview?: string;
    vote_average?: number;
}

export interface SeasonDetails extends Season {
    episodes: Episode[];
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

    // TV Show specific fields
    number_of_seasons?: number;
    number_of_episodes?: number;
    seasons?: Season[];
    episode_run_time?: number[];
    first_air_date?: string;
    last_air_date?: string;
    in_production?: boolean;
    networks?: { id: number; name: string; logo_path: string | null; }[];
    created_by?: { id: number; name: string; profile_path: string | null; }[];
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
        getMovieById: builder.query<Movie, { id: number; mediaType?: 'movie' | 'tv' }>({
            query: ({ id, mediaType = 'movie' }) => ({
                url: `${API_CONFIG.ENDPOINTS.MOVIE.GET_BY_ID}/${id}${mediaType ? `?mediaType=${mediaType}` : ''}`,
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
        getSeasonDetails: builder.query<SeasonDetails, { tvId: number; seasonNumber: number }>({
            query: ({ tvId, seasonNumber }) => ({
                url: `${API_CONFIG.ENDPOINTS.MOVIE.GET_BY_ID}/${tvId}/season/${seasonNumber}`,
                method: 'GET',
            }),
            // Transform the response
            transformResponse: (response: { data?: SeasonDetails }) => {
                if (response?.data) {
                    return response.data;
                }
                return response as SeasonDetails;
            },
        }),
    }),
});

export const { useLazySearchMoviesQuery, useGetTrendingMoviesQuery, useGetMovieByIdQuery, useLazyGetSeasonDetailsQuery } = movieApi;

