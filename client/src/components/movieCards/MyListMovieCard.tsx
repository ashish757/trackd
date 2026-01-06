import { useGetMovieByIdQuery, type Movie } from '../../redux/movie/movieApi.ts';
import { Film, Star, Calendar } from 'lucide-react';
import { MovieCardSkeleton } from '../skeletons';
import { memo } from 'react';
import MovieCardControls from './MovieCardControls.tsx';
import { MovieStatus } from '../../redux/userMovie/userMovieApi.ts';
import type { ViewMode } from '../../types/movie.types';

interface MyListMovieCardProps {
    movieId: number;
    movieData?: Movie;
    onClick?: (movie: Movie) => void;
    viewMode?: ViewMode;
    userRating?: number | null;
    currentStatus?: MovieStatus | null;
    isFavorite?: boolean;
    onControlsSuccess?: () => void;
}

const MyListMovieCard = memo(({
    movieId,
    movieData: providedMovieData,
    onClick,
    viewMode = 'grid',
    userRating,
    currentStatus,
    isFavorite = false,
    onControlsSuccess
}: MyListMovieCardProps) => {
    // Only fetch if movieData is not provided
    const { data: fetchedMovieData, isLoading, isError } = useGetMovieByIdQuery(
        { id: movieId, mediaType: providedMovieData?.media_type as 'movie' | 'tv' | undefined },
        { skip: !!providedMovieData } // Skip fetching if data is already provided
    );

    // Use provided movieData or fetched data
    const movieData = providedMovieData || fetchedMovieData;

    if (isLoading) {
        return <MovieCardSkeleton count={1} layout={viewMode} />;
    }

    if (isError || !movieData) {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-2/3 bg-gray-200 flex items-center justify-center">
                    <Film className="h-12 w-12 text-gray-400" />
                </div>
                <div className="p-3">
                    <p className="text-sm font-medium text-gray-900">Movie #{movieId}</p>
                    <p className="text-xs text-red-500">Failed to load</p>
                </div>
            </div>
        );
    }

    // List view rendering
    if (viewMode === 'list') {
        return (
            <div
                onClick={() => onClick?.(movieData)}
                className="bg-white p-1 md:p-2 cursor-pointer group mb-0"
            >
                <div className="flex gap-2 md:gap-4">
                    {/* Poster */}
                    <div className="w-10 md:w-16 shrink-0">
                        <div className="aspect-2/3 bg-gray-200 rounded overflow-hidden">
                            {movieData.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${movieData.poster_path}`}
                                    alt={movieData.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-2 mb-1">

                                <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                                    <span className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {movieData.title}
                                    </span>
                                    {movieData.release_date && (
                                        <span className="flex items-center gap-1">
                                                    {new Date(movieData.release_date).getFullYear()}
                                        </span>
                                    )}
                                    {movieData.vote_average && movieData.vote_average > 0 && (
                                        <span title={"Average Rating"}  className="flex items-center gap-1">
                                            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                                            {movieData.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                    {userRating && (
                                        <span title={"Your Rating"} className="flex items-center gap-1 text-blue-600 font-medium">
                                             <Star className="w-3 h-3 md:w-4 md:h-4 text-pink-500 fill-pink-500" />
                                             {userRating}
                                         </span>
                                    )}
                                </div>

                        </div>


                        {movieData.genres && movieData.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                                {movieData.genres.slice(0, 3).map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="px-2 py-0.5 md:py-1 bg-gray-50 text-gray-600 text-xs rounded"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Movie Controls */}
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                            <MovieCardControls
                                movieId={movieId}
                                currentStatus={currentStatus}
                                isFavorite={isFavorite}
                                onSuccess={onControlsSuccess}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid view rendering (default)
    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl cursor-pointer group"
            onClick={() => onClick?.(movieData)}
        >
            {/* Poster */}
            <div className="aspect-2/3 bg-linear-to-br from-gray-300 to-gray-200 flex items-center justify-center overflow-hidden relative">
                {movieData.poster_path ? (
                    <>
                        <img
                            src={`https://image.tmdb.org/t/p/w342${movieData.poster_path}`}
                            alt={movieData.title}
                            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Rating Badge */}
                        {movieData.vote_average && movieData.vote_average > 0 && (
                            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{movieData.vote_average.toFixed(1)}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <Film className="h-12 w-12 text-gray-400" />
                    </div>
                )}
            </div>

            {/* Simple Movie Info - Just Title and Year */}
            <div className="p-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm md:text-base" title={movieData.title}>
                    {movieData.title}
                </h3>

                {/* Year */}
                <div className="mt-1 flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    {movieData.release_date && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(movieData.release_date).getFullYear()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

MyListMovieCard.displayName = 'MyListMovieCard';

export default MyListMovieCard;

