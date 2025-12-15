import { Film } from 'lucide-react';
import type { Movie } from '../redux/movie/movieApi';
import MovieSearchItem from './MovieSearchItem';

interface SearchDropdownProps {
  show: boolean;
  isSearching: boolean;
  isError: boolean;
  suggestions: Movie[];
  searchQuery: string;
  onMovieClick: (movie: Movie) => void;
}

/**
 * Search dropdown component that displays movie search results.
 * Shows loading, error, results, or empty states.
 */
export default function SearchDropdown({
  show,
  isSearching,
  isError,
  suggestions,
  searchQuery,
  onMovieClick,
}: SearchDropdownProps) {
  if (!show) return null;

  return (
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
              onClick={onMovieClick}
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
  );
}

