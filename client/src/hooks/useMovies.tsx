import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Movie, MovieState } from '../types';
import { getMovies, addMovie, updateMovie, removeMovie, initializeMovies } from '../utils/movies';

interface MovieContextType extends MovieState {
  addMovieToList: (movie: Movie) => void;
  updateMovieInList: (movieId: string, updates: Partial<Movie>) => void;
  removeMovieFromList: (movieId: string) => void;
  getMoviesByStatus: (status: Movie['status']) => Movie[];
  refreshMovies: () => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

interface MovieProviderProps {
  children: ReactNode;
}

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
  const [movieState, setMovieState] = useState<MovieState>({
    movies: [],
    watchlist: [],
    completed: [],
    planToWatch: [],
    isLoading: true,
    error: null,
  });

  const loadMovies = () => {
    setMovieState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const movies = getMovies();
      const watchlist = movies.filter(movie => movie.status === 'watching');
      const completed = movies.filter(movie => movie.status === 'completed');
      const planToWatch = movies.filter(movie => movie.status === 'plan_to_watch');
      
      setMovieState({
        movies,
        watchlist,
        completed,
        planToWatch,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setMovieState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load movies',
      }));
    }
  };

  useEffect(() => {
    // Initialize with mock data if no movies exist
    initializeMovies();
    loadMovies();
  }, []);

  const addMovieToList = (movie: Movie) => {
    try {
      addMovie(movie);
      loadMovies();
    } catch (error) {
      setMovieState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add movie',
      }));
    }
  };

  const updateMovieInList = (movieId: string, updates: Partial<Movie>) => {
    try {
      updateMovie(movieId, updates);
      loadMovies();
    } catch (error) {
      setMovieState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update movie',
      }));
    }
  };

  const removeMovieFromList = (movieId: string) => {
    try {
      removeMovie(movieId);
      loadMovies();
    } catch (error) {
      setMovieState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove movie',
      }));
    }
  };

  const getMoviesByStatus = (status: Movie['status']): Movie[] => {
    return movieState.movies.filter(movie => movie.status === status);
  };

  const refreshMovies = () => {
    loadMovies();
  };

  const value: MovieContextType = {
    ...movieState,
    addMovieToList,
    updateMovieInList,
    removeMovieFromList,
    getMoviesByStatus,
    refreshMovies,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};
