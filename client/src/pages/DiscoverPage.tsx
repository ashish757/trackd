import { useState, useEffect, useRef } from 'react';
import { Search, Film, X, Filter, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLazySearchMoviesQuery, type Movie } from '../redux/movie/movieApi';
import MovieInfoModel from "../components/MovieInfoModel.tsx";
import MovieCard from "../components/MovieCard.tsx";
import MovieSearchItem from "../components/MovieSearchItem.tsx";
import { useDebounce } from '../hooks/useDebounce';
import { useClickOutside } from '../hooks/useClickOutside';
import { SEARCH_CONFIG } from '../constants/search';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [showMovieInfo, setShowMovieInfo] = useState(false);
    const [infoMovie, setInfoMovie] = useState<Movie | null>(null);

    // Filter states
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [minRating, setMinRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<string>('popularity.desc');

    // Custom hooks
    const debouncedQuery = useDebounce(searchQuery, SEARCH_CONFIG.DEBOUNCE_DELAY);
    useClickOutside(searchRef, () => setShowSuggestions(false));

    // RTK Query hooks
    const [triggerSearch, { data: searchResults, isLoading, isFetching, isError }] = useLazySearchMoviesQuery();

    // Hide suggestions when query is too short
    useEffect(() => {
        if (searchQuery.length < SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    // Trigger API search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
            triggerSearch(debouncedQuery);
            setShowSuggestions(true);
        }
    }, [debouncedQuery, triggerSearch]);


    const handleSuggestionClick = (movie: Movie) => {
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        setShowMovieInfo(true);
        setInfoMovie(movie);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
    };

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

    // Filter and sort results
    const filteredResults = searchResults?.results
        ? searchResults.results.filter(movie => {
            if (selectedYear && movie.release_date) {
                const movieYear = new Date(movie.release_date).getFullYear();
                if (movieYear !== selectedYear) return false;
            }
            if (minRating > 0 && movie.vote_average < minRating) return false;
            return true;
        }).sort((a, b) => {
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
        })
        : [];

    const suggestions = searchResults?.results || [];
    const isSearching = isLoading || isFetching;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">

                    {/* Hero Section */}
                    <div className="max-w-6xl mx-auto mb-8">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                Advanced Movie Discovery
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Search with filters to find exactly what you're looking for
                            </p>
                        </div>

                        {/* Search Bar with Filter Toggle */}
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1 relative" ref={searchRef}>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => searchQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH && setShowSuggestions(true)}
                                            placeholder="Search for movies..."
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

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-6 py-4 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                                        showFilters || hasActiveFilters
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    <SlidersHorizontal className="h-5 w-5" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                            {selectedGenres.length + (selectedYear ? 1 : 0) + (minRating > 0 ? 1 : 0)}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Filters Panel */}
                            {showFilters && (
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                                    {/* Genres */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-semibold text-gray-700">Genres</label>
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
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Year */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Release Year
                                            </label>
                                            <select
                                                value={selectedYear || ''}
                                                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="">All Years</option>
                                                {YEARS.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Rating */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Sort By
                                            </label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
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
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                    {showMovieInfo && <MovieInfoModel onClose={setShowMovieInfo} movie={infoMovie} />}

                    {/* Search Results */}
                    {debouncedQuery && (
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Search Results for "{debouncedQuery}"
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {filteredResults.length} {filteredResults.length === 1 ? 'movie' : 'movies'} found
                                </p>
                            </div>

                            {isSearching ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                </div>
                            ) : filteredResults.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {filteredResults.map((movie) => (
                                        <MovieCard
                                            key={movie.id}
                                            movie={movie}
                                            onClick={() => handleSuggestionClick(movie)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <Film className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600 text-lg">
                                        No movies match your filters. Try adjusting your search criteria.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {!debouncedQuery && (
                        <div className="max-w-4xl mx-auto text-center py-20">
                            <Filter className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Start Your Search
                            </h3>
                            <p className="text-gray-600 text-lg">
                                Use the search bar and filters above to discover movies
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

