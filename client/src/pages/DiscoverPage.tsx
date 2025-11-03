// filepath: /Users/ashish/Developer/Trackd/client/src/pages/DiscoverPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Search, Film, X, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLazySearchMoviesQuery, useGetTrendingMoviesQuery, type Movie } from '../redux/movie/movieApi';

export default function DiscoverPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // RTK Query hooks
    const [triggerSearch, { data: searchResults, isLoading, isFetching, isError }] = useLazySearchMoviesQuery();
    const { data: trendingData, isLoading: isTrendingLoading, isError: isTrendingError } = useGetTrendingMoviesQuery();

    // Debounce search query with 500ms delay
    useEffect(() => {
        console.log('🔤 Search query changed:', searchQuery);
        if (searchQuery.length < 2) {
            setDebouncedQuery('');
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(() => {
            console.log('⏰ Debounce complete, setting debounced query:', searchQuery);
            setDebouncedQuery(searchQuery);
        }, 500); // 500ms debounce delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Trigger API search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            console.log('🔍 Triggering search for:', debouncedQuery);

            // Cancel previous request if exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            triggerSearch(debouncedQuery);
            setShowSuggestions(true);
        }
    }, [debouncedQuery, triggerSearch]);

    // Log search results
    useEffect(() => {
        console.log('📊 Search state:', {
            isLoading,
            isFetching,
            isError,
            resultsCount: searchResults?.results?.length || 0,
            hasData: !!searchResults
        });
    }, [searchResults, isLoading, isFetching, isError]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
            // TODO: Implement full search functionality
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (movie: Movie) => {
        console.log('Selected movie:', movie);
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        // TODO: Navigate to movie details page or show movie info
    };

    const clearSearch = () => {
        setSearchQuery('');
        setDebouncedQuery('');
        setShowSuggestions(false);
    };

    // Get suggestions from API results
    const suggestions = searchResults?.results || [];
    const isSearching = isLoading || isFetching;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Hero Section with Search */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                Discover Movies & TV Shows
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Search and track your favorite movies and series
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative" ref={searchRef}>
                            <form onSubmit={handleSearchSubmit}>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                                        placeholder="Search for movies, TV shows..."
                                        className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                                        autoComplete="off"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-5 w-5 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                                    {isSearching ? (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                                            <p className="mt-2">Searching...</p>
                                        </div>
                                    ) : isError ? (
                                        <div className="px-4 py-8 text-center text-red-500">
                                            <p>Error loading results. Please try again.</p>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <ul className="max-h-96 overflow-y-auto">
                                            {suggestions.map((movie) => (
                                                <li key={movie.id}>
                                                    <button
                                                        onClick={() => handleSuggestionClick(movie)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                                    >
                                                        <div className="flex-shrink-0 w-12 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                                            {movie.poster_path ? (
                                                                <img
                                                                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
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
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            <Film className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                            <p>No results found for "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trending Movies Section */}
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Trending Today</h2>
                        </div>

                        {isTrendingLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : isTrendingError ? (
                            <div className="text-center py-20">
                                <p className="text-red-500">Failed to load trending movies. Please try again later.</p>
                            </div>
                        ) : trendingData?.results && trendingData.results.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {trendingData.results.slice(0, 10).map((movie) => (
                                    <div
                                        key={movie.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                                        onClick={() => handleSuggestionClick(movie)}
                                    >
                                        <div className="aspect-[2/3] bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center overflow-hidden relative">
                                            {movie.poster_path ? (
                                                <>
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    {movie.vote_average > 0 && (
                                                        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                                                            ⭐ {movie.vote_average.toFixed(1)}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <Film className="h-12 w-12 text-gray-400" />
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
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <Film className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500">No trending movies available at the moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="max-w-4xl mx-auto mt-12 p-6 bg-green-50 border border-green-200 rounded-xl">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                            ✅ Search Integration Active
                        </h3>
                        <p className="text-green-800">
                            Live movie search powered by TMDB API. Start typing in the search bar to see real-time suggestions with a 500ms debounce for optimal performance.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}

