import { useState, useEffect } from 'react';
import { Film, LayoutGrid, List, Calendar, Star } from 'lucide-react';
import MyListMovieCard from './MyListMovieCard';
import MovieCard from './MovieCard';
import { useGetMovieByIdQuery, type Movie } from '../redux/movie/movieApi';
import { MovieStatus } from '../redux/userMovie/userMovieApi';
import { MovieGridSkeleton } from './skeletons';
import { storage } from '../utils/config';

const VIEW_MODE_KEY = 'movie_view_mode';

interface MovieEntry {
    id: string;
    movieId: number;
    status?: MovieStatus;
    isFavorite?: boolean;
    rating?: number | null;
    movieData?: Movie; // Optional: For when movie data is already available (trending, etc.)
}

interface MovieCardsViewProps {
    movies: MovieEntry[];
    isLoading?: boolean;
    onMovieClick: (movie: Movie) => void;
    getBadge?: (entry: MovieEntry) => { text: string; color: 'green' | 'blue' | 'purple' | 'yellow' | 'pink' };
    emptyStateMessage?: string;
    showViewToggle?: boolean;
    defaultView?: 'grid' | 'list';
    viewModeStorageKey?: string; // Optional custom storage key for different pages
    useSimpleMovieCard?: boolean; // If true, use MovieCard instead of MyListMovieCard (for trending, discover, etc.)
}

export default function MovieCardsView({
    movies,
    isLoading = false,
    onMovieClick,
    getBadge,
    emptyStateMessage = 'No movies to display',
    showViewToggle = true,
    defaultView = 'grid',
    viewModeStorageKey,
    useSimpleMovieCard = false,
}: MovieCardsViewProps) {
    // Get initial view mode from localStorage or use default
    const getInitialViewMode = (): 'grid' | 'list' => {
        const storageKey = viewModeStorageKey || VIEW_MODE_KEY;
        const savedMode = storage.getItem(storageKey) as 'grid' | 'list' | null;
        return savedMode || defaultView;
    };

    const [viewMode, setViewMode] = useState<'grid' | 'list'>(getInitialViewMode);

    // Save view mode to localStorage whenever it changes
    useEffect(() => {
        const storageKey = viewModeStorageKey || VIEW_MODE_KEY;
        storage.setItem(storageKey, viewMode);
    }, [viewMode, viewModeStorageKey]);

    if (isLoading) {
        return <MovieGridSkeleton count={10} />;
    }

    if (movies.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No movies yet
                </h3>
                <p className="text-gray-600">{emptyStateMessage}</p>
            </div>
        );
    }

    return (
        <>
            {/* View Mode Toggle */}
            {showViewToggle && (
                <div className="flex justify-end mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title="Grid view"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title="List view"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Movie Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {movies.map((entry) => {
                        if (useSimpleMovieCard && entry.movieData) {
                            // Use MovieCard for trending/discover (data already available)
                            return (
                                <MovieCard
                                    key={entry.id}
                                    movie={entry.movieData}
                                    onClick={onMovieClick}
                                    badge={getBadge ? getBadge(entry) : undefined}
                                />
                            );
                        }
                        // Use MyListMovieCard for user lists (fetches data by ID)
                        return (
                            <MyListMovieCard
                                key={entry.id}
                                movieId={entry.movieId}
                                onClick={onMovieClick}
                                badge={getBadge ? getBadge(entry) : undefined}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-3">
                    {movies.map((entry) => (
                        <MovieListItem
                            key={entry.id}
                            entry={entry}
                            onClick={onMovieClick}
                            badge={getBadge ? getBadge(entry) : undefined}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

// List view item component
interface MovieListItemProps {
    entry: MovieEntry;
    onClick: (movie: Movie) => void;
    badge?: { text: string; color: 'green' | 'blue' | 'purple' | 'yellow' | 'pink' };
}

const MovieListItem = ({ entry, onClick, badge }: MovieListItemProps) => {
    // Only fetch if movieData is not already provided
    const { data: fetchedMovieData, isLoading } = useGetMovieByIdQuery(entry.movieId, {
        skip: !!entry.movieData, // Skip fetching if data is already available
    });

    // Use provided movieData or fetched data
    const movieData = entry.movieData || fetchedMovieData;

    if (isLoading) {
        return (
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
        );
    }

    if (!movieData) return null;

    const badgeColors = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        yellow: 'bg-yellow-500',
        pink: 'bg-pink-500',
    };

    return (
        <div
            onClick={() => onClick(movieData)}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
        >
            <div className="flex gap-4">
                {/* Poster */}
                <div className="w-20 shrink-0">
                    <div className="aspect-2/3 bg-gray-200 rounded overflow-hidden">
                        {movieData.poster_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w185${movieData.poster_path}`}
                                alt={movieData.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {movieData.title}
                        </h3>
                        {badge && (
                            <span className={`${badgeColors[badge.color]} text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                                {badge.text}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        {movieData.release_date && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(movieData.release_date).getFullYear()}
                            </span>
                        )}
                        {movieData.vote_average && movieData.vote_average > 0 && (
                            <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                {movieData.vote_average.toFixed(1)}
                            </span>
                        )}
                        {entry.rating && (
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                                Your rating: {entry.rating}/10
                            </span>
                        )}
                    </div>

                    {movieData.overview && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {movieData.overview}
                        </p>
                    )}

                    {movieData.genres && movieData.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {movieData.genres.slice(0, 3).map((genre) => (
                                <span
                                    key={genre.id}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
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
};

