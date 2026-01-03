import { useGetMovieByIdQuery, type Movie } from '../redux/movie/movieApi';
import { Film, Star, Calendar } from 'lucide-react';
import { MovieCardSkeleton } from './skeletons';
import { memo } from 'react';

interface MyListMovieCardProps {
    movieId: number;
    onClick?: (movie: Movie) => void;
    badge?: {
        text: string;
        color: 'green' | 'blue' | 'purple' | 'yellow' | 'pink';
    };
    viewMode?: 'grid' | 'list';
    userRating?: number | null;
}

const badgeColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
};

const MyListMovieCard = memo(({ movieId, onClick, badge, viewMode = 'grid', userRating }: MyListMovieCardProps) => {
    const { data: movieData, isLoading, isError } = useGetMovieByIdQuery(movieId);

    if (isLoading) {
        return viewMode === 'list' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="flex gap-4">
                    <div className="w-20 h-28 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </div>
        ) : (
            <MovieCardSkeleton />
        );
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
                className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
                <div className="flex gap-3 md:gap-4">
                    {/* Poster */}
                    <div className="w-16 md:w-20 shrink-0">
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
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {movieData.title}
                            </h3>
                            {badge && (
                                <span className={`${badgeColors[badge.color]} text-white px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                                    {badge.text}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                            {movieData.release_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    {new Date(movieData.release_date).getFullYear()}
                                </span>
                            )}
                            {movieData.vote_average && movieData.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                                    {movieData.vote_average.toFixed(1)}
                                </span>
                            )}
                            {userRating && (
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                    Your rating: {userRating}
                                </span>
                            )}
                        </div>

                        {movieData.overview && (
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-2">
                                {movieData.overview}
                            </p>
                        )}

                        {movieData.genres && movieData.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                                {movieData.genres.slice(0, 3).map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="px-2 py-0.5 md:py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Grid view rendering (default)
    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => onClick?.(movieData)}
        >
            {/* Poster */}
            <div className="aspect-2/3 bg-linear-to-br from-gray-300 to-gray-200 flex items-center justify-center overflow-hidden relative">
                {movieData.poster_path ? (
                    <>
                        <img
                            src={`https://image.tmdb.org/t/p/w342${movieData.poster_path}`}
                            alt={movieData.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Rating Badge */}
                        {movieData.vote_average && movieData.vote_average > 0 && (
                            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{movieData.vote_average.toFixed(1)}</span>
                            </div>
                        )}
                        {/* Custom Badge */}
                        {badge && (
                            <div className={`absolute top-2 left-2 ${badgeColors[badge.color]} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                                {badge.text}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <Film className="h-12 w-12 text-gray-400" />
                        {badge && (
                            <div className={`mt-2 ${badgeColors[badge.color]} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                                {badge.text}
                            </div>
                        )}
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

