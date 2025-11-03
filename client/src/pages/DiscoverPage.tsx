// filepath: /Users/ashish/Developer/Trackd/client/src/pages/DiscoverPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Search, Film, X } from 'lucide-react';
import Navbar from '../components/Navbar';

interface MovieSuggestion {
    id: number;
    title: string;
    year: string;
    type: string;
}

// Mock data for suggestions - Replace with actual API call
const mockSuggestions: MovieSuggestion[] = [
    { id: 1, title: 'The Shawshank Redemption', year: '1994', type: 'Movie' },
    { id: 2, title: 'The Dark Knight', year: '2008', type: 'Movie' },
    { id: 3, title: 'Inception', year: '2010', type: 'Movie' },
    { id: 4, title: 'Interstellar', year: '2014', type: 'Movie' },
    { id: 5, title: 'Breaking Bad', year: '2008-2013', type: 'TV Series' },
];

export default function DiscoverPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Handle search with debounce
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            // Filter mock data based on search query
            // TODO: Replace with actual API call
            const filtered = mockSuggestions.filter(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

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

    const handleSuggestionClick = (movie: MovieSuggestion) => {
        console.log('Selected movie:', movie);
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        // TODO: Navigate to movie details page or show movie info
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

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
                                    ) : suggestions.length > 0 ? (
                                        <ul className="max-h-96 overflow-y-auto">
                                            {suggestions.map((movie) => (
                                                <li key={movie.id}>
                                                    <button
                                                        onClick={() => handleSuggestionClick(movie)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                                    >
                                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                            <Film className="h-5 w-5 text-gray-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{movie.title}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {movie.year} • {movie.type}
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

                    {/* Popular/Trending Section - Placeholder */}
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Movies</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {/* Placeholder movie cards */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                                >
                                    <div className="aspect-[2/3] bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                                        <Film className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-900 truncate">Movie Title {index}</h3>
                                        <p className="text-sm text-gray-600">2024</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="max-w-4xl mx-auto mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            🎬 Search Integration Coming Soon
                        </h3>
                        <p className="text-blue-800">
                            This page will be integrated with a movie database API (like TMDB or OMDb) to provide real-time search results, movie details, and tracking functionality.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}

