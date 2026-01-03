import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Search, X, TrendingUp, Rss } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLazySearchMoviesQuery, useGetTrendingMoviesQuery, type Movie } from '../redux/movie/movieApi';
import TrendingMoviesSection from "../components/TrendingMoviesSection.tsx";
import SearchDropdown from "../components/SearchDropdown.tsx";
import Feed from "../components/Feed.tsx";
import { useDebounce } from '../hooks/useDebounce';
import { useClickOutside } from '../hooks/useClickOutside';
import { SEARCH_CONFIG } from '../constants/search';
import { logger } from '../utils/logger';
import { storage } from '../utils/config';

// Lazy load heavy modal component
const MovieInfoModel = lazy(() => import("../components/MovieInfoModel.tsx"));

type TabType = 'feed' | 'trending';

const LAST_TAB_KEY = 'home_last_active_tab';

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get state from URL, fallback to localStorage, then default to 'feed'
    const getInitialTab = (): TabType => {
        const urlTab = searchParams.get('tab') as TabType;
        if (urlTab) return urlTab;

        const savedTab = storage.getItem(LAST_TAB_KEY) as TabType;
        return savedTab || 'feed';
    };

    const activeTab = getInitialTab();
    const movieId = searchParams.get('movie');

    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [infoMovie, setInfoMovie] = useState<Movie | null>(null);
    const isInitialMount = useRef(true);

    // Custom hooks
    const debouncedQuery = useDebounce(searchQuery, SEARCH_CONFIG.DEBOUNCE_DELAY);
    useClickOutside(searchRef, () => setShowSuggestions(false));

    // RTK Query hooks
    const [triggerSearch, { data: searchResults, isLoading, isFetching, isError }] = useLazySearchMoviesQuery();
    const { data: trendingData, isLoading: isTrendingLoading, isError: isTrendingError } = useGetTrendingMoviesQuery();

    // Sync URL with saved tab preference on mount
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            const urlTab = searchParams.get('tab');
            if (!urlTab && activeTab !== 'feed') {
                // No tab in URL but we have a saved preference, update URL
                const newParams = new URLSearchParams(searchParams);
                newParams.set('tab', activeTab);
                setSearchParams(newParams, { replace: true }); // Use replace to avoid adding to history
            }
        }
    }, [activeTab, searchParams, setSearchParams]);

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        storage.setItem(LAST_TAB_KEY, activeTab);
    }, [activeTab]);

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

    // Handle tab switching via URL
    const handleTabChange = useCallback((tab: TabType) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('tab', tab);
        // Keep movie param if it exists
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Handle opening movie modal via URL
    const handleOpenMovie = useCallback((movie: Movie) => {
        logger.log('Opening movie:', movie);
        setInfoMovie(movie);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('movie', movie.id.toString());
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Handle closing movie modal
    const handleCloseMovie = useCallback(() => {
        setInfoMovie(null);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('movie');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleSuggestionClick = useCallback((movie: Movie) => {
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        handleOpenMovie(movie);
    }, [handleOpenMovie]);

    const handleCardClick = useCallback((movie: Movie) => {
        setShowSuggestions(false);
        handleOpenMovie(movie);
    }, [handleOpenMovie]);

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
            <main className="min-h-screen pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-4 md:py-8">

                    {/* Logo Section - Mobile Only, Scrollable */}
                    <div className="md:hidden flex justify-center mb-6">
                        <div className="flex items-center gap-2">
                            <img alt="Trackd" src="/logo.svg" className="h-10 w-auto" />
                            <span className="text-2xl font-bold text-gray-900">Trackd</span>
                        </div>
                    </div>

                    {/* Hero Section with Search */}
                    <div className="max-w-4xl mx-auto mb-8 md:mb-12">
                        <div className="text-center mb-6 md:mb-8">
                            <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-3">
                                Discover Movies & TV Shows
                            </h1>
                            <p className="text-gray-600 text-sm md:text-lg">
                                Search and track your favorite movies and series
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative" ref={searchRef}>
                            <div className="relative">
                                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH && setShowSuggestions(true)}
                                    placeholder="Search for movies, TV shows..."
                                    className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-lg md:rounded-md focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                                    autoComplete="off"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
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


                    {/* Tabs */}
                    <div className="flex mb-4 md:mb-6 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-hide">
                        <div className="inline-flex md:p-1">
                            <button
                                onClick={() => handleTabChange('feed')}
                                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
                                    activeTab === 'feed'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hover:bg-gray-200'
                                }`}
                            >
                                <Rss className="w-4 h-4" />
                                <span className="hidden sm:inline">Feed</span>
                                <span className="sm:hidden">Feed</span>
                            </button>
                            <button
                                onClick={() => handleTabChange('trending')}
                                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 font-medium text-sm md:text-base transition-colors whitespace-nowrap ${
                                    activeTab === 'trending'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 md:hover:bg-gray-200'
                                }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span className="hidden sm:inline">Trending</span>
                                <span className="sm:hidden">Trending</span>
                            </button>
                        </div>
                    </div>



                    {/* Conditional Content Based on Active Tab */}
                    {activeTab === 'feed' ? (
                        <Feed />
                    ) : (
                        <TrendingMoviesSection
                            handleSuggestionClick={handleCardClick}
                            isTrendingLoading={isTrendingLoading}
                            isTrendingError={isTrendingError}
                            trendingData={trendingData}
                        />
                    )}


                    {/*{Movie info model}*/}
                    {movieId && infoMovie ? (
                        <Suspense fallback={<div />}>
                            <MovieInfoModel onClose={handleCloseMovie} movie={infoMovie} />
                        </Suspense>
                    ) : null}

                </div>
            </main>
        </>
    );
}

