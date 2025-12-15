import { apiSlice } from '../apiSlice';

export const MovieStatus = {
    WATCHED: 'WATCHED',
    PLANNED: 'PLANNED',
} as const;

export type MovieStatus = typeof MovieStatus[keyof typeof MovieStatus];

export interface UserMovieEntry {
    id: number;
    user_id: number;
    movie_id: number;
    status: MovieStatus;
    createdAt: string;
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
                url: '/user-movies/mark',
                method: 'POST',
                body: dto,
            }),
            invalidatesTags: ['UserMovies'],
        }),
        removeMovie: builder.mutation<{ status: string; statusCode: number; message: string }, number>({
            query: (movieId) => ({
                url: `/user-movies/${movieId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['UserMovies'],
        }),
        getUserMovies: builder.query<UserMoviesResponse, void>({
            query: () => ({
                url: '/user-movies',
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        getUserMoviesByStatus: builder.query<UserMoviesResponse, MovieStatus>({
            query: (status) => ({
                url: `/user-movies/by-status?status=${status}`,
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        getMovieEntry: builder.query<MarkMovieResponse, number>({
            query: (movieId) => ({
                url: `/user-movies/movie/${movieId}`,
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        getUserStats: builder.query<UserStatsResponse, void>({
            query: () => ({
                url: '/user-movies/stats',
                method: 'GET',
            }),
            providesTags: ['UserMovies'],
        }),
        rateMovie: builder.mutation<RateMovieResponse, { movieId: number; rating: number; description?: string }>({
            query: (dto) => ({
                url: '/user-movies/rate',
                method: 'POST',
                body: dto,
            }),
            invalidatesTags: ['UserMovies', 'MovieRating'],
        }),
        getUserMovieRating: builder.query<GetRatingResponse, number>({
            query: (movieId) => ({
                url: `/user-movies/rating/${movieId}`,
                method: 'GET',
            }),
            providesTags: ['MovieRating'],
        }),
        removeRating: builder.mutation<{ status: string; statusCode: number; message: string }, number>({
            query: (movieId) => ({
                url: `/user-movies/rating/${movieId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['UserMovies', 'MovieRating'],
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
} = userMovieApi;



