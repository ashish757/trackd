import React from 'react';
import { Search } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  selectedGenre: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

const genres = [
  { id: 'all', name: 'All Genres' },
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'animation', name: 'Animation' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'crime', name: 'Crime' },
  { id: 'documentary', name: 'Documentary' },
  { id: 'drama', name: 'Drama' },
  { id: 'family', name: 'Family' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'history', name: 'History' },
  { id: 'horror', name: 'Horror' },
  { id: 'music', name: 'Music' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'romance', name: 'Romance' },
  { id: 'sci-fi', name: 'Science Fiction' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'war', name: 'War' },
  { id: 'western', name: 'Western' },
];

const sortOptions = [
  { id: 'rating', name: 'Rating (High to Low)' },
  { id: 'year', name: 'Year (Newest First)' },
  { id: 'title', name: 'Title (A to Z)' },
];

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  selectedGenre,
  sortBy,
  onSearchChange,
  onGenreChange,
  onSortChange
}) => {
  return (
    <div className="card p-6 mb-8">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="input-icon-left h-5 w-5" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Genre Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => onGenreChange(e.target.value)}
              className="input"
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="input"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
