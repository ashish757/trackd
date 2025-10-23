import type { Movie } from '../types';

const STORAGE_KEY = 'trackd_movies';

export const saveMovies = (movies: Movie[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
};

export const getMovies = (): Movie[] => {
  const moviesData = localStorage.getItem(STORAGE_KEY);
  if (!moviesData) return [];
  
  try {
    const movies = JSON.parse(moviesData);
    return movies.map((movie: Movie) => ({
      ...movie,
      addedAt: new Date(movie.addedAt),
      updatedAt: new Date(movie.updatedAt),
    }));
  } catch {
    return [];
  }
};

export const addMovie = (movie: Movie): void => {
  const movies = getMovies();
  const updatedMovies = [...movies, movie];
  saveMovies(updatedMovies);
};

export const updateMovie = (movieId: string, updates: Partial<Movie>): void => {
  const movies = getMovies();
  const updatedMovies = movies.map(movie => 
    movie.id === movieId 
      ? { ...movie, ...updates, updatedAt: new Date() }
      : movie
  );
  saveMovies(updatedMovies);
};

export const removeMovie = (movieId: string): void => {
  const movies = getMovies();
  const updatedMovies = movies.filter(movie => movie.id !== movieId);
  saveMovies(updatedMovies);
};

export const getMoviesByStatus = (status: Movie['status']): Movie[] => {
  const movies = getMovies();
  return movies.filter(movie => movie.status === status);
};

// Mock movie data for demo
export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterPath: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    releaseDate: '2010-07-16',
    voteAverage: 8.4,
    voteCount: 23456,
    genreIds: [28, 878],
    genres: ['Action', 'Sci-Fi'],
    runtime: 148,
    status: 'completed',
    rating: 5,
    notes: 'Mind-bending masterpiece!',
    addedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'The Dark Knight',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterPath: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
    releaseDate: '2008-07-18',
    voteAverage: 9.0,
    voteCount: 28947,
    genreIds: [28, 80, 18],
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 152,
    status: 'completed',
    rating: 5,
    notes: 'Heath Ledger\'s performance is legendary',
    addedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterPath: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/nCbkOyOMTEwlEV0LtCOvCnwEONA.jpg',
    releaseDate: '2014-11-07',
    voteAverage: 8.6,
    voteCount: 19876,
    genreIds: [12, 18, 878],
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    runtime: 169,
    status: 'watching',
    rating: 4,
    notes: 'Currently watching - amazing visuals!',
    addedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    title: 'Pulp Fiction',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterPath: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2QM528GluxMcE.jpg',
    releaseDate: '1994-10-14',
    voteAverage: 8.9,
    voteCount: 23456,
    genreIds: [80, 53],
    genres: ['Crime', 'Thriller'],
    runtime: 154,
    status: 'plan_to_watch',
    addedAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
];

// Initialize with mock data if no movies exist
export const initializeMovies = (): void => {
  const existingMovies = getMovies();
  if (existingMovies.length === 0) {
    saveMovies(mockMovies);
  }
};
