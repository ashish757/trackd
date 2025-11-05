import { useGetMovieByIdQuery, type Movie } from '../redux/movie/movieApi';
import MovieCard from './MovieCard';
import { Film } from 'lucide-react';

interface MovieCardWithDetailsProps {
    movieId: number;
    onClick?: (movie: Movie) => void;
    badge?: {
        text: string;
        color: 'green' | 'blue' | 'purple' | 'yellow';
    };
}

const MovieCardWithDetails = ({ movieId, onClick, badge }: MovieCardWithDetailsProps) => {
    const { data: movieData, isLoading, isError } = useGetMovieByIdQuery(movieId);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
                <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
            </div>
        );
    }

    if (isError || !movieData) {
        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                    <Film className="h-12 w-12 text-gray-400" />
                </div>
                <div className="p-3">
                    <p className="text-sm font-medium text-gray-900">Movie #{movieId}</p>
                    <p className="text-xs text-red-500">Failed to load</p>
                </div>
            </div>
        );
    }

    return <MovieCard movie={movieData} onClick={onClick} badge={badge} />;
};

export default MovieCardWithDetails;

