import { useState, useEffect, useMemo } from 'react';
import { Film, LayoutGrid, List } from 'lucide-react';
import MyListMovieCard from './MyListMovieCard.tsx';
import MovieCard from './MovieCard.tsx';
import type { Movie } from '../../redux/movie/movieApi.ts';
import { useGetUserMoviesQuery, type MovieStatus } from '../../redux/userMovie/userMovieApi.ts';
import { MovieCardSkeleton } from '../skeletons';
import { storage } from '../../utils/config.ts';
import type { MovieEntry, MovieBadge, ViewMode } from '../../types/movie.types';

const VIEW_MODE_KEY = 'movie_view_mode';

interface MovieCardsViewProps {
    movies: MovieEntry[];
    isLoading?: boolean;
    onMovieClick: (movie: Movie) => void;
    getBadge?: (entry: MovieEntry) => MovieBadge;
    emptyStateMessage?: string;
    showViewToggle?: boolean;
    defaultView?: ViewMode;
    viewModeStorageKey?: string;
    useSimpleMovieCard?: boolean;
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
    // Fetch user's movies to check status and favorites
    const { data: userMoviesData } = useGetUserMoviesQuery();

    // Create a lookup map for O(1) access to user's movie data
    const userMoviesMap = useMemo(() => {
        if (!userMoviesData?.data) return new Map();

        const map = new Map<number, { status: MovieStatus | null; isFavorite: boolean; rating: number | null }>();
        userMoviesData.data.forEach((userMovie) => {
            map.set(userMovie.movieId, {
                status: userMovie.status,
                isFavorite: userMovie.isFavorite,
                rating: userMovie.rating,
            });
        });
        return map;
    }, [userMoviesData]);

    // Get initial view mode from localStorage or use default
    const getInitialViewMode = (): ViewMode => {
        const storageKey = viewModeStorageKey || VIEW_MODE_KEY;
        const savedMode = storage.getItem(storageKey) as ViewMode | null;
        return savedMode || defaultView;
    };

    const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

    // Save view mode to localStorage whenever it changes
    useEffect(() => {
        const storageKey = viewModeStorageKey || VIEW_MODE_KEY;
        storage.setItem(storageKey, viewMode);
    }, [viewMode, viewModeStorageKey]);

    if (isLoading) {
        if(viewMode === 'list') {
            return <div className={"flex-col space-y-3"}>

                <MovieCardSkeleton count={5} layout="list" />
            </div>

        }
        if(viewMode === 'grid') {
            return <div className={"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"}>
             <MovieCardSkeleton count={10} />
            </div>
        }
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
                    // Get user's data for this movie from the map
                    const userData = userMoviesMap.get(entry.movieId);

                    // Merge entry data with user data (user data takes precedence)
                    const enrichedEntry = {
                        ...entry,
                        status: userData?.status ?? entry.status,
                        isFavorite: userData?.isFavorite ?? entry.isFavorite ?? false,
                        rating: userData?.rating ?? entry.rating,
                    };

                    if (useSimpleMovieCard && entry.movieData) {
                        // Use MovieCard for trending/discover (data already available)
                        return (
                            <MovieCard
                                key={entry.id}
                                movie={entry.movieData}
                                onClick={onMovieClick}
                                badge={getBadge ? getBadge(enrichedEntry) : undefined}
                                viewMode={viewMode}
                                currentStatus={enrichedEntry.status}
                                isFavorite={enrichedEntry.isFavorite}
                                onControlsSuccess={() => {
                                    // Optionally refetch data or handle success
                                }}
                            />
                        );
                    }

                    // Use MyListMovieCard for user lists
                    // If movieData is available, pass it to avoid fetching
                    return (
                        <MyListMovieCard
                            key={entry.id}
                            movieId={entry.movieId}
                            movieData={entry.movieData} // Pass movieData if available
                            onClick={onMovieClick}
                            viewMode={viewMode}
                            userRating={enrichedEntry.rating}
                            currentStatus={enrichedEntry.status}
                            isFavorite={enrichedEntry.isFavorite}
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
