import React, { useState } from 'react';
import type { Movie } from '../types';
import { Star, Play, Plus, Check, X, Edit3 } from 'lucide-react';
import { useMovies } from '../hooks/useMovies';

interface MovieCardProps {
  movie: Movie;
  showActions?: boolean;
  onEdit?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, showActions = true, onEdit }) => {
  const { updateMovieInList, removeMovieFromList } = useMovies();
  const [isHovered, setIsHovered] = useState(false);

  const handleStatusChange = (newStatus: Movie['status']) => {
    updateMovieInList(movie.id, { status: newStatus });
  };

  const handleRemove = () => {
    removeMovieFromList(movie.id);
  };

  const getStatusColor = (status: Movie['status']) => {
    switch (status) {
      case 'watching':
        return 'text-accent-color';
      case 'completed':
        return 'text-success-color';
      case 'plan_to_watch':
        return 'text-warning-color';
      case 'dropped':
        return 'text-error-color';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status: Movie['status']) => {
    switch (status) {
      case 'watching':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'plan_to_watch':
        return <Plus className="h-4 w-4" />;
      case 'dropped':
        return <X className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  return (
    <div
      className="group relative bg-background-secondary rounded-lg overflow-hidden border border-border-color hover:border-primary-color transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterPath}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit?.(movie)}
                className="p-2 bg-background-secondary rounded-full hover:bg-background-tertiary transition-colors"
                title="Edit movie"
              >
                <Edit3 className="h-4 w-4 text-text-primary" />
              </button>
              <button
                onClick={handleRemove}
                className="p-2 bg-error-color rounded-full hover:bg-red-600 transition-colors"
                title="Remove movie"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-background-secondary ${getStatusColor(movie.status)}`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(movie.status)}
            <span className="capitalize">
              {movie.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Rating */}
        {movie.rating && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-accent-color text-background-primary">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-current" />
              <span>{movie.rating}/5</span>
            </div>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-color transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>{new Date(movie.releaseDate).getFullYear()}</span>
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-accent-color text-accent-color" />
            <span>{movie.voteAverage.toFixed(1)}</span>
          </div>
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

        {showActions && (
          <div className="flex space-x-2">
            <select
              value={movie.status}
              onChange={(e) => handleStatusChange(e.target.value as Movie['status'])}
              className="flex-1 px-2 py-1 text-xs bg-background-tertiary border border-border-color rounded text-text-primary focus:outline-none focus:border-primary-color"
            >
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        )}

        {/* Notes */}
        {movie.notes && (
          <div className="mt-3 p-2 bg-background-tertiary rounded text-xs text-text-secondary">
            <p className="line-clamp-2">{movie.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
