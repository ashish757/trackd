import { Film } from 'lucide-react';
import type { Movie } from '../redux/movie/movieApi';
import { getTMDBImageUrl } from '../constants/tmdb';

interface MovieSearchItemProps {
    movie: Movie;
    onClick: (movie: Movie) => void;
}

/**
 * A list-style movie item component for search suggestions and dropdowns.
 * Displays a small poster thumbnail with movie title, year, and rating.
 */
const MovieSearchItem = ({ movie, onClick }: MovieSearchItemProps) => {
    const posterUrl = getTMDBImageUrl(movie.poster_path, 'POSTER_SMALL');

    return (
        <li>
            <button
                onClick={() => onClick(movie)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
                <div className="shrink-0 w-12 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Film className="h-6 w-6 text-gray-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{movie.title}</p>
                    <p className="text-sm text-gray-500">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        {movie.vote_average > 0 && ` • ⭐ ${movie.vote_average.toFixed(1)}`}
                    </p>
                </div>
            </button>
        </li>
    );
};

export default MovieSearchItem;

