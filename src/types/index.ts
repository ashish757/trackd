export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  genres: string[];
  runtime?: number;
  status: 'watching' | 'completed' | 'plan_to_watch' | 'dropped';
  rating?: number;
  notes?: string;
  addedAt: Date;
  updatedAt: Date;
}

export interface MovieList {
  id: string;
  name: string;
  description: string;
  movies: Movie[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MovieState {
  movies: Movie[];
  watchlist: Movie[];
  completed: Movie[];
  planToWatch: Movie[];
  isLoading: boolean;
  error: string | null;
}

export interface FormData {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface ProfileFormData {
  name: string;
  bio: string;
  avatar?: File;
}
