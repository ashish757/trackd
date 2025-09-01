import { useState, useMemo } from 'react';
import type { Movie } from '../types';

// Mock popular movies for demo
const popularMovies: Movie[] = [
  {
    id: 'discover-1',
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterPath: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    releaseDate: '1994-09-23',
    voteAverage: 9.3,
    voteCount: 24567,
    genreIds: [18, 80],
    genres: ['Drama', 'Crime'],
    runtime: 142,
    status: 'plan_to_watch',
    addedAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'discover-2',
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
    posterPath: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    releaseDate: '1972-03-24',
    voteAverage: 9.2,
    voteCount: 18923,
    genreIds: [18, 80],
    genres: ['Drama', 'Crime'],
    runtime: 175,
    status: 'plan_to_watch',
    addedAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'discover-3',
    title: 'The Dark Knight',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterPath: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
    releaseDate: '2008-07-18',
    voteAverage: 9.0,
    voteCount: 28567,
    genreIds: [28, 80, 18],
    genres: ['Action', 'Crime', 'Drama'],
    runtime: 152,
    status: 'plan_to_watch',
    addedAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more movies as needed...
];

export const useDiscoverMovies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');

  const filteredMovies = useMemo(() => {
    let filtered = [...popularMovies];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchLower) ||
          movie.overview.toLowerCase().includes(searchLower) ||
          movie.genres.some((genre: string) => genre.toLowerCase().includes(searchLower))
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter((movie) =>
        movie.genres.some((genre: string) => 
          genre.toLowerCase().includes(selectedGenre.toLowerCase()) ||
          selectedGenre === 'sci-fi' && genre.toLowerCase() === 'science fiction'
        )
      );
    }

    // Sort movies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.voteAverage - a.voteAverage;
        case 'year':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedGenre, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    filteredMovies,
  };
};
