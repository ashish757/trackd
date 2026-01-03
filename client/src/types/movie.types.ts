/**
 * Shared Movie-related types across the frontend
 * Centralizes type definitions to ensure consistency
 */

import type { Movie } from '../redux/movie/movieApi';
import type { MovieStatus } from '../redux/userMovie/userMovieApi';

/**
 * Badge configuration for movie cards
 */
export interface MovieBadge {
    text: string;
    color: 'green' | 'blue' | 'purple' | 'yellow' | 'pink';
}

/**
 * Movie entry with user-specific data
 * Used for displaying movies with user's watch status and favorites
 */
export interface MovieEntry {
    id: string; // String ID for React keys
    movieId: number; // TMDB movie ID (number)
    status: MovieStatus | null; // User's watch status (null for favorite-only or unwatched)
    isFavorite?: boolean; // Whether user has added this movie to favorites
    rating?: number | null; // User's rating (1-10)
    movieData?: Movie; // Optional: Pre-fetched TMDB movie data
}

/**
 * View mode for displaying movies
 */
export type ViewMode = 'grid' | 'list';

/**
 * Skeleton layout type
 */
export type SkeletonLayout = 'grid' | 'list';

