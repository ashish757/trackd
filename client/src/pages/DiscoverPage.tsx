import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { Search, Film, X, Filter, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLazySearchMoviesQuery, useGetMovieByIdQuery, type Movie } from '../redux/movie/movieApi';
import MovieCardsView from "../components/movieCards/MovieCardsView.tsx";
import { useDebounce } from '../hooks/useDebounce';
import { SEARCH_CONFIG } from '../constants/search';
import type { MovieEntry } from '../types/movie.types';

// Lazy load heavy modal component
const MovieInfoModel = lazy(() => import("../components/MovieInfoModel.tsx"));

const DISCOVER_VIEW_MODE_KEY = 'discover_view_mode';

// Genre mapping from TMDB
const GENRES = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
];

const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Popularity (High to Low)' },
    { value: 'popularity.asc', label: 'Popularity (Low to High)' },
    { value: 'vote_average.desc', label: 'Rating (High to Low)' },
    { value: 'vote_average.asc', label: 'Rating (Low to High)' },
    { value: 'release_date.desc', label: 'Release Date (Newest)' },
    { value: 'release_date.asc', label: 'Release Date (Oldest)' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

export default function DiscoverPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const movieId = searchParams.get('movie');
    const mediaType = searchParams.get('mediaType') as 'movie' | 'tv' | null;
    const urlQuery = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(urlQuery);
    const [showFilters, setShowFilters] = useState(false);
    const [infoMovie, setInfoMovie] = useState<Movie | null>(null);
    const isInitialMount = useRef(true);

    // Filter states
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [minRating, setMinRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<string>('popularity.desc');

    // Custom hooks
    const debouncedQuery = useDebounce(searchQuery, SEARCH_CONFIG.DEBOUNCE_DELAY);

    // RTK Query hooks
    const [triggerSearch, { data: searchResults, isLoading, isFetching }] = useLazySearchMoviesQuery();

    // Fetch movie/TV show details if movieId in URL
    const { data: movieFromUrl } = useGetMovieByIdQuery(
        { id: Number(movieId), mediaType: mediaType || undefined },
        { skip: !movieId }
    );

    // Set infoMovie when movie is fetched from URL
    useEffect(() => {
        if (movieFromUrl && movieId && !infoMovie) {
            setInfoMovie(movieFromUrl);
        }
    }, [movieFromUrl, movieId, infoMovie]);

    // Sync search query with URL parameter
    useEffect(() => {
        if (debouncedQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('q', debouncedQuery);
            setSearchParams(newParams, { replace: true });
        } else if (debouncedQuery.length === 0) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('q');
            setSearchParams(newParams, { replace: true });
        }
    }, [debouncedQuery, searchParams, setSearchParams]);

    // Trigger search on mount if URL has query
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            if (urlQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
                triggerSearch(urlQuery);
            }
        }
    }, [urlQuery, triggerSearch]);

    // Trigger API search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
            triggerSearch(debouncedQuery);
        }
    }, [debouncedQuery, triggerSearch]);

    // Handle opening movie modal via URL
    const handleOpenMovie = useCallback((movie: Movie) => {
        setInfoMovie(movie);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('movie', movie.id.toString());
        if (movie.media_type) {
            newParams.set('mediaType', movie.media_type);
        }
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Handle closing movie modal
    const handleCloseMovie = useCallback(() => {
        setInfoMovie(null);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('movie');
        newParams.delete('mediaType');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleMovieClick = useCallback((movie: Movie) => {
        handleOpenMovie(movie);
    }, [handleOpenMovie]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('q');
        setSearchParams(newParams, { replace: true });
    }, [searchParams, setSearchParams]);

    const toggleGenre = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSelectedYear(null);
        setMinRating(0);
        setSortBy('popularity.desc');
    };

    const hasActiveFilters = selectedGenres.length > 0 || selectedYear !== null || minRating > 0;

    // Filter and sort results with useMemo for performance
    const filteredResults = useMemo(() => {
        if (!searchResults?.results) return [];

        return searchResults.results
            .filter(movie => {
                if (selectedYear && movie.release_date) {
                    const movieYear = new Date(movie.release_date).getFullYear();
                    if (movieYear !== selectedYear) return false;
                }
                if (minRating > 0 && movie.vote_average < minRating) return false;
                return true;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'popularity.desc':
                        return (b.vote_average || 0) - (a.vote_average || 0);
                    case 'popularity.asc':
                        return (a.vote_average || 0) - (b.vote_average || 0);
                    case 'vote_average.desc':
                        return (b.vote_average || 0) - (a.vote_average || 0);
                    case 'vote_average.asc':
                        return (a.vote_average || 0) - (b.vote_average || 0);
                    case 'release_date.desc':
                        return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
                    case 'release_date.asc':
                        return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
                    default:
                        return 0;
                }
            });
    }, [searchResults, selectedYear, minRating, sortBy]);

    const isSearching = isLoading || isFetching;

    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-4 md:py-8">

                    {/* Hero Section */}
                    <div className="max-w-6xl mx-auto mb-4 md:mb-8">
                        <div className="text-center mb-4 md:mb-8">
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
                                Advanced Discovery
                            </h1>
                            <p className="text-gray-600 text-sm md:text-lg">
                                Search for movies and TV shows with filters
                            </p>
                        </div>

                        {/* Search Bar with Filter Toggle */}
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex gap-2 md:gap-3">
                                <div className="flex-1 relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search for movies and TV shows..."
                                            className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 text-sm md:text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors shadow-xm"
                                            autoComplete="off"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-3 md:px-6 py-3 md:py-4 rounded-md font-medium transition-colors flex items-center gap-2 relative ${
                                        showFilters || hasActiveFilters
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    <SlidersHorizontal className="h-5 w-5" />
                                    <span className="hidden md:inline">Filters</span>
                                    {hasActiveFilters && (
                                        <span className="absolute -top-1 -right-1 md:static md:translate-x-0 md:translate-y-0 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                            {selectedGenres.length + (selectedYear ? 1 : 0) + (minRating > 0 ? 1 : 0)}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Filters Panel */}
                            {showFilters && (
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-6 shadow-sm space-y-4 md:space-y-6">
                                    {/* Genres */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2 md:mb-3">
                                            <label className="text-xs md:text-sm font-semibold text-gray-700">Genres</label>
                                            {selectedGenres.length > 0 && (
                                                <button
                                                    onClick={() => setSelectedGenres([])}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {GENRES.map(genre => (
                                                <button
                                                    key={genre.id}
                                                    onClick={() => toggleGenre(genre.id)}
                                                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                                                        selectedGenres.includes(genre.id)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {genre.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                        {/* Year */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                                                Release Year
                                            </label>
                                            <select
                                                value={selectedYear || ''}
                                                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                                                className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="">All Years</option>
                                                {YEARS.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Rating */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                                                Minimum Rating: {minRating > 0 ? minRating.toFixed(1) : 'Any'}
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={minRating}
                                                onChange={(e) => setMinRating(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>

                                        {/* Sort */}
                                        <div>
                                            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                                                Sort By
                                            </label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            >
                                                {SORT_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Clear All Filters */}
                                    {hasActiveFilters && (
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <button
                                                onClick={clearFilters}
                                                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Clear All Filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Movie Info Modal */}
                    {movieId && infoMovie && (
                        <Suspense fallback={<div />}>
                            <MovieInfoModel onClose={handleCloseMovie} movie={infoMovie} />
                        </Suspense>
                    )}

                    {/* Search Results */}
                    {debouncedQuery && (
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-4">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                    Search Results for "{debouncedQuery}"
                                </h2>
                                <p className="text-gray-600 text-sm md:text-base mt-1">
                                    {
                                        isSearching
                                            ? 'Searching...'
                                            : filteredResults.length === searchResults?.results.length
                                                ? `Showing all ${filteredResults.length} results`
                                                : `Showing ${filteredResults.length} of ${searchResults?.results.length} results`
                                    }
                                </p>
                            </div>

                            {filteredResults.length > 0 || isSearching ? (
                                <MovieCardsView
                                    movies={filteredResults.map((movie): MovieEntry => ({
                                        id: movie.id.toString(),
                                        movieId: movie.id,
                                        movieData: movie,
                                        status: null,
                                        isFavorite: false,
                                    }))}
                                    isLoading={isSearching}
                                    onMovieClick={handleMovieClick}
                                    showViewToggle={true}
                                    defaultView="grid"
                                    viewModeStorageKey={DISCOVER_VIEW_MODE_KEY}
                                    useSimpleMovieCard={true}
                                    emptyStateMessage="No results found"
                                />
                            ) : (
                                <div className="text-center py-12 md:py-20">
                                    <Film className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600 text-sm md:text-lg">
                                        No results match your filters. Try adjusting your search criteria.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {!debouncedQuery && (
                        <div className="max-w-4xl mx-auto text-center py-12 md:py-20">
                            <Filter className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                Start Your Search
                            </h3>
                            <p className="text-gray-600 text-sm md:text-lg">
                                Use the search bar and filters above to discover movies and TV shows
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

