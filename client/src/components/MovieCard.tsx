import { Film, Star, Calendar } from 'lucide-react';
import type { Movie } from '../redux/movie/movieApi';
import { memo } from 'react';

interface MovieCardProps {
    movie: Movie;
    onClick?: (movie: Movie) => void;
    badge?: {
        text: string;
        color: 'green' | 'blue' | 'purple' | 'yellow' | 'pink';
    };
    viewMode?: 'grid' | 'list';
}

const badgeColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
};

// Simple MovieCard - Just poster, year, genre, rating (supports both grid and list views)
const MovieCard = memo(({ movie, onClick, badge, viewMode = 'grid' }: MovieCardProps) => {
    // List view rendering
    if (viewMode === 'list') {
        return (
            <div
                onClick={() => onClick?.(movie)}
                className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
                <div className="flex gap-3 md:gap-4">
                    {/* Poster */}
                    <div className="w-16 md:w-20 shrink-0">
                        <div className="aspect-[2/3] bg-gray-200 rounded overflow-hidden">
                            {movie.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                    alt={movie.title}
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
                                {movie.title}
                            </h3>
                            {badge && (
                                <span className={`${badgeColors[badge.color]} text-white px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                                    {badge.text}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-xs md:text-sm text-gray-600">
                            {movie.release_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                    {new Date(movie.release_date).getFullYear()}
                                </span>
                            )}
                            {movie.vote_average && movie.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            )}
                        </div>

                        {movie.overview && (
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-2">
                                {movie.overview}
                            </p>
                        )}

                        {movie.genres && movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                                {movie.genres.slice(0, 3).map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
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
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl cursor-pointer group"
            onClick={() => onClick?.(movie)}
        >
            {/* Poster */}
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center overflow-hidden relative">
                {movie.poster_path ? (
                    <>
                        <img
                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Rating Badge */}
                        {movie.vote_average && movie.vote_average > 0 && (
                            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{movie.vote_average.toFixed(1)}</span>
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

            {/* Movie Info */}
            <div className="p-3">
                <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base" title={movie.title}>
                    {movie.title}
                </h3>

                {/* Year and Genre */}
                <div className="mt-1 flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    {movie.release_date && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(movie.release_date).getFullYear()}
                        </span>
                    )}
                    {movie.genres && movie.genres.length > 0 && (
                        <span className="truncate">• {movie.genres[0].name}</span>
                    )}
                </div>
            </div>
        </div>
    );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;

