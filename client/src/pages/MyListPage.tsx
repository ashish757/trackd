import { useState, useCallback } from 'react';
import { Check, Clock, Heart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.tsx';
import StatCard from '../components/StatCard.tsx';
import MovieCardsView from '../components/movieCards/MovieCardsView.tsx';
import { useGetUserStatsQuery, useGetUserMoviesByStatusQuery, useGetFavoriteMoviesQuery, MovieStatus } from '../redux/userMovie/userMovieApi.ts';
import MovieInfoModel from "../components/MovieInfoModel.tsx";
import type {Movie} from "../redux/movie/movieApi.ts";
import { StatCardSkeleton } from '../components/skeletons';

export default function MyListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const movieId = searchParams.get('movie');

    const [activeTab, setActiveTab] = useState<'all' | 'watched' | 'planned' | 'favorites'>('all');
    const [movieInfo, setMovieInfo] = useState<Movie | null>(null);

    const { data: statsData, isLoading: isStatsLoading } = useGetUserStatsQuery();

    // Fetch movies based on active tab
    const { data: watchedMovies, isLoading: isWatchedLoading } = useGetUserMoviesByStatusQuery(
        MovieStatus.WATCHED,
        { skip: activeTab !== 'watched' && activeTab !== 'all' }
    );

    const { data: plannedMovies, isLoading: isPlannedLoading } = useGetUserMoviesByStatusQuery(
        MovieStatus.PLANNED,
        { skip: activeTab !== 'planned' && activeTab !== 'all' }
    );

    const { data: favoriteMovies, isLoading: isFavoritesLoading } = useGetFavoriteMoviesQuery(
        undefined,
        { skip: activeTab !== 'favorites' }
    );

    const stats = {
        total: statsData?.data?.total || 0,
        watched: statsData?.data?.watched || 0,
        planned: statsData?.data?.planned || 0,
        favorites: statsData?.data?.favorites || 0,
    };

    // Determine what to show based on active tab
    const getMoviesToShow = () => {
        if (activeTab === 'watched') return watchedMovies?.data || [];
        if (activeTab === 'planned') return plannedMovies?.data || [];
        if (activeTab === 'favorites') return favoriteMovies?.data || [];
        // For 'all', combine both (but not favorites)
        return [...(watchedMovies?.data || []), ...(plannedMovies?.data || [])];
    };

    const handleCardClick = useCallback((movie: Movie) => {
        setMovieInfo(movie);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('movie', movie.id.toString());
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleCloseMovie = useCallback(() => {
        setMovieInfo(null);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('movie');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const moviesToShow = getMoviesToShow();
    const isLoading = isStatsLoading || isWatchedLoading || isPlannedLoading || isFavoritesLoading;

    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">My Movies</h1>
                        <p className="text-gray-600 text-lg">Track your watched and planned movies</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="max-w-6xl mx-auto mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {isStatsLoading ? (
                                <>
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </>
                            ) : (
                                <>
                                    <StatCard
                                        icon={Check}
                                        value={stats.watched}
                                        label="Watched"
                                        color="green"
                                    />
                                    <StatCard
                                        icon={Clock}
                                        value={stats.planned}
                                        label="Planned"
                                        color="blue"
                                    />
                                    <StatCard
                                        icon={Heart}
                                        value={stats.favorites}
                                        label="Fav Movies"
                                        color="pink"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="max-w-6xl mx-auto mb-6">
                        <div className="flex items-center justify-between border-b border-gray-200">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                        activeTab === 'all'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveTab('watched')}
                                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                        activeTab === 'watched'
                                            ? 'border-green-600 text-green-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Watched ({stats.watched})
                                </button>
                                <button
                                    onClick={() => setActiveTab('planned')}
                                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                        activeTab === 'planned'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Planned ({stats.planned})
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                                        activeTab === 'favorites'
                                            ? 'border-pink-600 text-pink-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                Favorites ({stats.favorites})
                            </button>
                        </div>
                        </div>
                    </div>

                    {/* Movie List */}
                    <div className="max-w-6xl mx-auto">
                        <MovieCardsView
                            movies={moviesToShow}
                            isLoading={isLoading}
                            onMovieClick={handleCardClick}
                            getBadge={(entry) => {
                                if (activeTab === 'favorites') {
                                    return { text: '❤️ Favorite', color: 'pink' as const };
                                }
                                return entry.status === MovieStatus.WATCHED
                                    ? { text: 'Watched', color: 'green' as const }
                                    : { text: 'Planned', color: 'blue' as const };
                            }}
                            emptyStateMessage="Start adding movies to track your watched and planned list!"
                            showViewToggle={true}
                            defaultView="grid"
                        />
                    </div>
                </div>
            </main>

            {movieId && movieInfo && <MovieInfoModel movie={movieInfo} onClose={handleCloseMovie} />}
        </>
    );
}


