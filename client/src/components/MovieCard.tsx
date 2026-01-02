import { Film } from 'lucide-react';
import type { Movie } from '../redux/movie/movieApi';
import { memo } from 'react';

interface MovieCardProps {
    movie: Movie;
    onClick?: (movie: Movie) => void;
    badge?: {
        text: string;
        color: 'green' | 'blue' | 'purple' | 'yellow' | 'pink';
    };
}

const badgeColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
};

const MovieCard = memo(({ movie, onClick, badge }: MovieCardProps) => {
    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
            onClick={() => onClick?.(movie)}
        >
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center overflow-hidden relative">
                {movie.poster_path ? (
                    <>
                        <img
                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {movie.vote_average && movie.vote_average > 0 ? (
                            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                                ⭐ {movie.vote_average.toFixed(1)}
                            </div>
                        ): null}
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
            <div className="p-3">
                <h3 className="font-semibold text-gray-900 truncate" title={movie.title}>
                    {movie.title}
                </h3>
                <p className="text-sm text-gray-600">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
            </div>
        </div>
    );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;

