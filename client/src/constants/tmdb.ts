/**
 * TMDB (The Movie Database) API constants
 */

export const TMDB_IMAGE_SIZES = {
  /** Small poster (92px width) - Used for thumbnails */
  POSTER_SMALL: 'w92',
  /** Medium poster (342px width) - Used for cards */
  POSTER_MEDIUM: 'w342',
  /** Large poster (500px width) - Used for details */
  POSTER_LARGE: 'w500',
  /** Original size backdrop image */
  BACKDROP: 'original',
} as const;

export const TMDB_BASE_URL = {
  IMAGE: 'https://image.tmdb.org/t/p/',
} as const;

/**
 * Helper function to generate TMDB image URLs
 * @param path - Image path from TMDB API
 * @param size - Desired image size
 * @returns Full image URL or null if path is invalid
 */
export const getTMDBImageUrl = (
  path: string | null,
  size: keyof typeof TMDB_IMAGE_SIZES
): string | null => {
  if (!path) return null;
  return `${TMDB_BASE_URL.IMAGE}${TMDB_IMAGE_SIZES[size]}${path}`;
};

