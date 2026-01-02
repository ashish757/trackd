import { apiSlice } from '../apiSlice';
import { API_CONFIG } from '../../config/api.config';

export const MovieStatus = {
    WATCHED: 'WATCHED',
    PLANNED: 'PLANNED',
    WATCHING: 'WATCHING',
    DROPPED: 'DROPPED',
    ON_HOLD: 'ON_HOLD',
} as const;

export type MovieStatus = typeof MovieStatus[keyof typeof MovieStatus];

export interface UserMovieEntry {
    id: string;
    userId: string;
    movieId: number;
    status: MovieStatus;
    isFavorite: boolean;
    rating: number | null;
    review: string | null;
    createdAt: string;
    updatedAt: string;
    movie: {
        id: number;
    };
}

export interface UserMovieRating {
    id: string;
    user_id: string;
    movie_id: number;
    rating: number | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

interface UserMoviesResponse {
    status: string;
    statusCode: number;
    message: string;
    data: UserMovieEntry[];
}

interface UserStatsResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        watched: number;
        planned: number;
        total: number;
        favorites: number;
    };
}

interface MarkMovieResponse {
    status: string;
    statusCode: number;
    message: string;
    data: UserMovieEntry;
}

interface RateMovieResponse {
    status: string;
    statusCode: number;
    message: string;
    data: UserMovieRating;
}

interface GetRatingResponse {
    status: string;
    statusCode: number;
    message: string;
    data: UserMovieRating | null;
}

export const userMovieApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        markMovie: builder.mutation<MarkMovieResponse, { movieId: number; status: MovieStatus }>({
            query: (dto) => ({
                url: API_CONFIG.ENDPOINTS.USER_MOVIES.MARK,
                method: 'POST',
                body: dto,
            }),
            invalidatesTags: ['UserMovies'],
        }),
        removeMovie: builder.mutation<{ status: string; statusCode: number; message: string }, number>({
            query: (movieId) => ({
                url: `${API_CONFIG.ENDPOINTS.USER_MOVIES.DELETE}/${movieId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['UserMovies'],
        }),
        getUserMovies: builder.query<UserMoviesResponse, void>({
            query: () => ({
                url: API_CONFIG.ENDPOINTS.USER_MOVIES.GET_ALL,
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        getUserMoviesByStatus: builder.query<UserMoviesResponse, MovieStatus>({
            query: (status) => ({
                url: `${API_CONFIG.ENDPOINTS.USER_MOVIES.GET_BY_STATUS}?status=${status}`,
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        getMovieEntry: builder.query<MarkMovieResponse, number>({
            query: (movieId) => ({
                url: `${API_CONFIG.ENDPOINTS.USER_MOVIES.GET_ENTRY}/${movieId}`,
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        getUserStats: builder.query<UserStatsResponse, void>({
            query: () => ({
                url: API_CONFIG.ENDPOINTS.USER_MOVIES.GET_STATS,
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        rateMovie: builder.mutation<RateMovieResponse, { movieId: number; rating: number; description?: string }>({
            query: (dto) => ({
                url: API_CONFIG.ENDPOINTS.USER_MOVIES.RATE,
                method: 'POST',
                body: dto,
            }),
            invalidatesTags: ['UserMovies', 'MovieRating'],
        }),
        getUserMovieRating: builder.query<GetRatingResponse, number>({
            query: (movieId) => ({
                url: `${API_CONFIG.ENDPOINTS.USER_MOVIES.GET_RATING}/${movieId}`,
                method: 'GET',
            }),
            providesTags: ['MovieRating'],
        }),
        removeRating: builder.mutation<{ status: string; statusCode: number; message: string }, number>({
            query: (movieId) => ({
                url: `${API_CONFIG.ENDPOINTS.USER_MOVIES.DELETE_RATING}/${movieId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['UserMovies', 'MovieRating'],
        }),
        toggleFavorite: builder.mutation<MarkMovieResponse, number>({
            query: (movieId) => ({
                url: `${API_CONFIG.ENDPOINTS.USER_MOVIES.TOGGLE_FAVORITE}/${movieId}`,
                method: 'POST',
            }),
            invalidatesTags: ['UserMovies'],
        }),
        getFavoriteMovies: builder.query<UserMoviesResponse, void>({
            query: () => ({
                url: API_CONFIG.ENDPOINTS.USER_MOVIES.GET_FAVORITES,
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
    }),
});

export const {
    useMarkMovieMutation,
    useRemoveMovieMutation,
    useGetUserMoviesQuery,
    useGetUserMoviesByStatusQuery,
    useGetMovieEntryQuery,
    useGetUserStatsQuery,
    useRateMovieMutation,
    useGetUserMovieRatingQuery,
    useRemoveRatingMutation,
    useToggleFavoriteMutation,
    useGetFavoriteMoviesQuery,
} = userMovieApi;



