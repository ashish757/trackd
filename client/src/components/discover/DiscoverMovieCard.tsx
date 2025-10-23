import React from 'react';
import { Plus, Star } from 'lucide-react';
import type { Movie } from '../../types';

interface DiscoverMovieCardProps {
  movie: Movie;
  index: number;
  onAddMovie: (movie: Movie) => void;
}

export const DiscoverMovieCard: React.FC<DiscoverMovieCardProps> = ({
  movie,
  index,
  onAddMovie
}) => {
  return (
    <div
      className="group relative bg-background-secondary rounded-lg overflow-hidden border border-border-color hover:border-primary-color transition-all duration-300 hover:shadow-lg"
      style={{
        animationDelay: `${index * 0.05}s`,
        animation: 'fadeIn 0.6s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterPath}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onAddMovie(movie)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add to List
          </button>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-accent-color text-background-primary">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-current" />
            <span>{movie.voteAverage.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-color transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>{new Date(movie.releaseDate).getFullYear()}</span>
          <span>{movie.runtime} min</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs bg-background-tertiary text-text-secondary rounded"
            >
              {genre}
            </span>
          ))}
        </div>

        <p className="text-xs text-text-secondary line-clamp-2">
          {movie.overview}
        </p>
      </div>
    </div>
  );
};
