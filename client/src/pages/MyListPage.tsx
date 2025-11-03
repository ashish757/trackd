// filepath: /Users/ashish/Developer/Trackd/client/src/pages/MyListPage.tsx
import { useState } from 'react';
import { Film, Plus, Check, Clock, Star, Calendar, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

interface TrackedMovie {
    id: number;
    title: string;
    year: string;
    type: 'movie' | 'series';
    status: 'watching' | 'completed' | 'plan-to-watch';
    rating?: number;
    progress?: {
        current: number;
        total: number;
    };
    addedDate: string;
}

export default function MyListPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'watching' | 'completed' | 'plan-to-watch'>('all');

    // Mock data - Replace with actual API data
    const [trackedMovies] = useState<TrackedMovie[]>([
        {
            id: 1,
            title: 'Breaking Bad',
            year: '2008-2013',
            type: 'series',
            status: 'watching',
            progress: { current: 3, total: 5 },
            rating: 5,
            addedDate: '2024-01-15'
        },
        {
            id: 2,
            title: 'The Shawshank Redemption',
            year: '1994',
            type: 'movie',
            status: 'completed',
            rating: 5,
            addedDate: '2024-01-10'
        },
        {
            id: 3,
            title: 'Inception',
            year: '2010',
            type: 'movie',
            status: 'plan-to-watch',
            addedDate: '2024-01-20'
        },
    ]);

    const filteredMovies = activeTab === 'all'
        ? trackedMovies
        : trackedMovies.filter(movie => movie.status === activeTab);

    const getStatusBadge = (status: TrackedMovie['status']) => {
        const badges = {
            'watching': { icon: Clock, text: 'Watching', color: 'bg-blue-100 text-blue-800' },
            'completed': { icon: Check, text: 'Completed', color: 'bg-green-100 text-green-800' },
            'plan-to-watch': { icon: Plus, text: 'Plan to Watch', color: 'bg-gray-100 text-gray-800' }
        };
        const badge = badges[status];
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="h-3 w-3" />
                {badge.text}
            </span>
        );
    };

    const renderRating = (rating?: number) => {
        if (!rating) return null;
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${
                            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const handleDeleteMovie = (id: number) => {
        // TODO: Implement delete functionality
        console.log('Delete movie:', id);
    };

    const stats = {
        total: trackedMovies.length,
        watching: trackedMovies.filter(m => m.status === 'watching').length,
        completed: trackedMovies.filter(m => m.status === 'completed').length,
        planToWatch: trackedMovies.filter(m => m.status === 'plan-to-watch').length
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="max-w-6xl mx-auto mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">My List</h1>
                        <p className="text-gray-600 text-lg">Track and manage your movies and TV shows</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="max-w-6xl mx-auto mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Film className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                        <p className="text-sm text-gray-600">Total</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.watching}</p>
                                        <p className="text-sm text-gray-600">Watching</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                                        <p className="text-sm text-gray-600">Completed</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Plus className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.planToWatch}</p>
                                        <p className="text-sm text-gray-600">Plan to Watch</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="max-w-6xl mx-auto mb-6">
                        <div className="flex gap-2 border-b border-gray-200">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'watching', label: 'Watching' },
                                { key: 'completed', label: 'Completed' },
                                { key: 'plan-to-watch', label: 'Plan to Watch' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                        activeTab === tab.key
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Movie List */}
                    <div className="max-w-6xl mx-auto">
                        {filteredMovies.length > 0 ? (
                            <div className="space-y-4">
                                {filteredMovies.map(movie => (
                                    <div
                                        key={movie.id}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex gap-6">
                                            {/* Poster Placeholder */}
                                            <div className="flex-shrink-0 w-24 h-36 bg-gradient-to-br from-gray-300 to-gray-200 rounded-lg flex items-center justify-center">
                                                <Film className="h-8 w-8 text-gray-400" />
                                            </div>

                                            {/* Movie Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                            {movie.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {movie.year} • {movie.type === 'movie' ? 'Movie' : 'TV Series'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteMovie(movie.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove from list"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4">
                                                    {getStatusBadge(movie.status)}
                                                    {movie.rating && renderRating(movie.rating)}
                                                    {movie.progress && (
                                                        <span className="text-sm text-gray-600">
                                                            Season {movie.progress.current} of {movie.progress.total}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        Added {new Date(movie.addedDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies found</h3>
                                <p className="text-gray-600 mb-6">
                                    {activeTab === 'all'
                                        ? 'Start tracking movies and TV shows to see them here.'
                                        : `No ${activeTab === 'plan-to-watch' ? 'planned' : activeTab} items yet.`}
                                </p>
                                <button
                                    onClick={() => window.location.href = '/discover'}
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Discover Movies
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="max-w-6xl mx-auto mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            📊 Track Your Progress
                        </h3>
                        <p className="text-blue-800">
                            This is a boilerplate for the movie tracking system. Future features will include:
                            detailed progress tracking, episode counts, custom ratings, notes, and more.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}

