import React from 'react';
import { useMovies } from '../hooks/useMovies';
import { useDiscoverMovies } from '../hooks/useDiscoverMovies';
import { SearchAndFilters } from '../components/discover/SearchAndFilters';
import { MovieGrid } from '../components/discover/MovieGrid';
import type { Movie } from '../types';

const Discover: React.FC = () => {
  const { addMovieToList } = useMovies();
  const {
    searchTerm,
    setSearchTerm,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    filteredMovies,
  } = useDiscoverMovies();

  const handleAddMovie = (movie: Movie) => {
    addMovieToList(movie);
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Discover Movies
          </h1>
          <p className="text-text-secondary">
            Find your next favorite movie from our curated collection
          </p>
        </div>

        <SearchAndFilters
          searchTerm={searchTerm}
          selectedGenre={selectedGenre}
          sortBy={sortBy}
          onSearchChange={setSearchTerm}
          onGenreChange={setSelectedGenre}
          onSortChange={(value) => setSortBy(value as 'rating' | 'year' | 'title')}
        />

        <MovieGrid
          movies={filteredMovies}
          searchTerm={searchTerm}
          onAddMovie={handleAddMovie}
        />
      </div>
    </div>
  );
};

export default Discover;
