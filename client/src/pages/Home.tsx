import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLazySearchMoviesQuery, useGetTrendingMoviesQuery, type Movie } from '../redux/movie/movieApi';
import MovieInfoModel from "../components/MovieInfoModel.tsx";
import TrendingMoviesSection from "../components/TrendingMoviesSection.tsx";
import SearchDropdown from "../components/SearchDropdown.tsx";
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

    const handleSuggestionClick = useCallback((movie: Movie) => {
        logger.log('Selected movie:', movie);
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        setShowMovieInfo(true);
        setInfoMovie(movie);
    }, []);

    const handleCardClick = useCallback((movie: Movie) => {
        logger.log('Selected movie:', movie);
        setShowSuggestions(false);
        setShowMovieInfo(true);
        setInfoMovie(movie);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setShowSuggestions(false);
    }, []);

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
                            <SearchDropdown
                                show={showSuggestions}
                                isSearching={isSearching}
                                isError={isError}
                                suggestions={suggestions}
                                searchQuery={searchQuery}
                                onMovieClick={handleSuggestionClick}
                            />
                        </div>
                    </div>

                    {/*{Movie info model}*/}
                    {showMovieInfo ? (<MovieInfoModel onClose={setShowMovieInfo} movie={infoMovie} />) : null}

                    {/* Trending Movies Section */}
                    <TrendingMoviesSection handleSuggestionClick={handleCardClick} isTrendingLoading={isTrendingLoading} isTrendingError={isTrendingError} trendingData={trendingData}/>



                </div>
            </main>
        </>
    );
}

