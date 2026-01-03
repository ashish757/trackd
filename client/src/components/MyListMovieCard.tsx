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
}

const badgeColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
};

const MyListMovieCard = memo(({ movieId, onClick, badge }: MyListMovieCardProps) => {
    const { data: movieData, isLoading, isError } = useGetMovieByIdQuery(movieId);

    if (isLoading) {
        return <MovieCardSkeleton />;
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

