import { useState, useCallback } from 'react';
import { Film, Check, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.tsx';
import MovieCardWithDetails from '../components/MovieCardWithDetails.tsx';
import StatCard from '../components/StatCard.tsx';
import { useGetUserStatsQuery, useGetUserMoviesByStatusQuery, MovieStatus } from '../redux/userMovie/userMovieApi.ts';
import MovieInfoModel from "../components/MovieInfoModel.tsx";
import type {Movie} from "../redux/movie/movieApi.ts";
import { StatCardSkeleton, MovieGridSkeleton } from '../components/skeletons';

export default function MyListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const movieId = searchParams.get('movie');

    const [activeTab, setActiveTab] = useState<'all' | 'watched' | 'planned'>('all');
    const [movieInfo, setMovieInfo] = useState<Movie | null>(null);

    // ...existing code...
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

    const stats = {
        total: statsData?.data?.total || 0,
        watched: statsData?.data?.watched || 0,
        planned: statsData?.data?.planned || 0,
    };

    // Determine what to show based on active tab
    const getMoviesToShow = () => {
        if (activeTab === 'watched') return watchedMovies?.data || [];
        if (activeTab === 'planned') return plannedMovies?.data || [];
        // For 'all', combine both
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
    const isLoading = isStatsLoading || isWatchedLoading || isPlannedLoading;

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
                                        icon={Film}
                                        value={stats.total}
                                        label="Total Movies"
                                        color="purple"
                                    />
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
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="max-w-6xl mx-auto mb-6">
                        <div className="flex gap-2 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                    activeTab === 'all'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                All ({stats.total})
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
                        </div>
                    </div>

                    {/* Movie List */}
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <MovieGridSkeleton count={10} />
                        ) : moviesToShow.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No movies yet
                                </h3>
                                <p className="text-gray-600">
                                    Start adding movies to track your watched and planned list!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {moviesToShow.map((entry) => (
                                    <MovieCardWithDetails
                                        key={entry.id}
                                        movieId={entry.movie_id}
                                        onClick={(movie) => handleCardClick(movie)}
                                        badge={{
                                            text: entry.status === MovieStatus.WATCHED ? 'Watched' : 'Planned',
                                            color: entry.status === MovieStatus.WATCHED ? 'green' : 'blue',
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="max-w-6xl mx-auto mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Simple Movie Tracking
                        </h3>
                        <p className="text-blue-800">
                            Mark movies as "Watched" or "Planned" to keep track of your viewing list.
                            You can remove movies anytime by clicking on them and using the remove button.
                        </p>
                    </div>
                </div>
            </main>

            {movieId && movieInfo && <MovieInfoModel movie={movieInfo} onClose={handleCloseMovie} />}
        </>
    );
}

