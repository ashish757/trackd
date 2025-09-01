import React from 'react';
import { Search } from 'lucide-react';
import type { Movie } from '../../types';
import { DiscoverMovieCard } from './DiscoverMovieCard';

interface MovieGridProps {
  movies: Movie[];
  searchTerm: string;
  onAddMovie: (movie: Movie) => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  searchTerm,
  onAddMovie
}) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-text-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          No movies found
        </h3>
        <p className="text-text-secondary">
          Try adjusting your search terms or filters
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Results Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Popular Movies
            {searchTerm && ` - "${searchTerm}"`}
          </h2>
          <span className="text-text-secondary">
            {movies.length} movie{movies.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie, index) => (
          <DiscoverMovieCard
            key={movie.id}
            movie={movie}
            index={index}
            onAddMovie={onAddMovie}
          />
        ))}
      </div>
    </>
  );
};
