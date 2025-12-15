import { useState, useEffect, useRef } from 'react';
import { Search, Film, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLazySearchMoviesQuery, useGetTrendingMoviesQuery, type Movie } from '../redux/movie/movieApi';
import MovieInfoModel from "../components/MovieInfoModel.tsx";
import TrendingMoviesSection from "../components/TrendingMoviesSection.tsx";
import MovieSearchItem from "../components/MovieSearchItem.tsx";
import { useDebounce } from '../hooks/useDebounce';
import { useClickOutside } from '../hooks/useClickOutside';
import { SEARCH_CONFIG } from '../constants/search';
import { logger } from '../utils/logger';


export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [showMovieInfo, setShowMovieInfo] = useState(false);
    const [infoMovie, setInfoMovie] = useState<Movie | null>(null);

    // Custom hooks
    const debouncedQuery = useDebounce(searchQuery, SEARCH_CONFIG.DEBOUNCE_DELAY);
    useClickOutside(searchRef, () => setShowSuggestions(false));

    // RTK Query hooks
    const [triggerSearch, { data: searchResults, isLoading, isFetching, isError }] = useLazySearchMoviesQuery();
    const { data: trendingData, isLoading: isTrendingLoading, isError: isTrendingError } = useGetTrendingMoviesQuery();

    // Hide suggestions when query is too short
    useEffect(() => {
        if (searchQuery.length < SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    // Trigger API search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
            logger.log('Triggering search for:', debouncedQuery);
            triggerSearch(debouncedQuery);
            setShowSuggestions(true);
        }
    }, [debouncedQuery, triggerSearch]);

    // Log search results (development only)
    useEffect(() => {
        logger.debug('Search state:', {
            isLoading,
            isFetching,
            isError,
            resultsCount: searchResults?.results?.length || 0,
            hasData: !!searchResults
        });
    }, [searchResults, isLoading, isFetching, isError]);

    const handleSuggestionClick = (movie: Movie) => {
        logger.log('Selected movie:', movie);
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        setShowMovieInfo(true);
        setInfoMovie(movie);
    };

    const handleCardClick = (movie: Movie) => {
        logger.log('Selected movie:', movie);
        setShowSuggestions(false);
        setShowMovieInfo(true);
        setInfoMovie(movie);

    };

    const clearSearch = () => {
        setSearchQuery('');
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
                                        onFocus={() => searchQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH && setShowSuggestions(true)}
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
                                                <MovieSearchItem
                                                    key={movie.id}
                                                    movie={movie}
                                                    onClick={handleSuggestionClick}
                                                />
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
                    <TrendingMoviesSection handleSuggestionClick={handleCardClick} isTrendingLoading={isTrendingLoading} isTrendingError={isTrendingError} trendingData={trendingData}/>

                    {/* Info Box */}
                    <div className="max-w-4xl mx-auto mt-12 p-6 bg-green-50 border border-green-200 rounded-xl">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">
                            Search Integration Active
                        </h3>
                        <p className="text-green-800">
                            Live movie search powered by TMDB API. Start typing in the search bar to see real-time suggestions with a {SEARCH_CONFIG.DEBOUNCE_DELAY}ms debounce for optimal performance.
                        </p>
                    </div>


                </div>
            </main>
        </>
    );
}

