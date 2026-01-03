import { useState, useEffect } from 'react';
import { Film, LayoutGrid, List } from 'lucide-react';
import MyListMovieCard from './MyListMovieCard';
import MovieCard from './MovieCard';
import type { Movie } from '../redux/movie/movieApi';
import { MovieStatus } from '../redux/userMovie/userMovieApi';
import { MovieGridSkeleton } from './skeletons';
import { storage } from '../utils/config';

const VIEW_MODE_KEY = 'movie_view_mode';

interface MovieEntry {
    id: string;
    movieId: number;
    status: MovieStatus | null;
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
            <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'
                : 'space-y-3'
            }>
                {movies.map((entry) => {
                    if (useSimpleMovieCard && entry.movieData) {
                        // Use MovieCard for trending/discover (data already available)
                        return (
                            <MovieCard
                                key={entry.id}
                                movie={entry.movieData}
                                onClick={onMovieClick}
                                badge={getBadge ? getBadge(entry) : undefined}
                                viewMode={viewMode}
                                currentStatus={entry.status}
                                isFavorite={entry.isFavorite}
                                onControlsSuccess={() => {
                                    // Optionally refetch data or handle success
                                }}
                            />
                        );
                    }
                    // Use MyListMovieCard for user lists (fetches data by ID)
                    return (
                        <MyListMovieCard
                            key={entry.id}
                            movieId={entry.movieId}
                            onClick={onMovieClick}
                            viewMode={viewMode}
                            userRating={entry.rating}
                            currentStatus={entry.status}
                            isFavorite={entry.isFavorite}
                            onControlsSuccess={() => {
                                // Optionally refetch data or handle success
                            }}
                        />
                    );
                })}
            </div>
        </>
    );
}
