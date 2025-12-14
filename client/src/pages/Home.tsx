import { useState, useEffect, useRef } from 'react';
import { Search, Film, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLazySearchMoviesQuery, useGetTrendingMoviesQuery, type Movie } from '../redux/movie/movieApi';
import MovieInfoModel from "../components/MovieInfoModel.tsx";
import TrendingMoviesSection from "../components/TrendingMoviesSection.tsx";


export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [showMovieInfo, setShowMovieInfo] = useState(false);
    const [infoMovie, setInfoMovie] = useState<Movie | null>(null);

    // RTK Query hooks
    const [triggerSearch, { data: searchResults, isLoading, isFetching, isError }] = useLazySearchMoviesQuery();
    const { data: trendingData, isLoading: isTrendingLoading, isError: isTrendingError } = useGetTrendingMoviesQuery();

    // Debounce search query with 300ms delay
    useEffect(() => {
        console.log('Search query changed:', searchQuery);
        if (searchQuery.length < 2) {
            setDebouncedQuery('');
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(() => {
            console.log('Debounce complete, setting debounced query:', searchQuery);
            setDebouncedQuery(searchQuery);
        }, 300); // 300ms debounce delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Trigger API search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            console.log('Triggering search for:', debouncedQuery);

            triggerSearch(debouncedQuery);
            setShowSuggestions(true);
        }
    }, [debouncedQuery, triggerSearch]);

    // Log search results
    useEffect(() => {
        console.log('Search state:', {
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

    const handleSuggestionClick = (movie: Movie) => {
        console.log('Selected movie:', movie);
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        setShowMovieInfo(true);
        setInfoMovie(movie);

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

                    {/*{Movie info model}*/}
                    {showMovieInfo ? (<MovieInfoModel onClose={setShowMovieInfo} movie={infoMovie} />) : null}

                    {/* Trending Movies Section */}
                    <TrendingMoviesSection handleSuggestionClick={handleSuggestionClick} isTrendingLoading={isTrendingLoading} isTrendingError={isTrendingError} trendingData={trendingData}/>

                    {/* Info Box */}
                    <div className="max-w-4xl mx-auto mt-12 p-6 bg-green-50 border border-green-200 rounded-xl">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                            Search Integration Active
                        </h3>
                        <p className="text-green-800">
                            Live movie search powered by TMDB API. Start typing in the search bar to see real-time suggestions with a 300ms debounce for optimal performance.
                        </p>
                    </div>


                </div>
            </main>
        </>
    );
}

