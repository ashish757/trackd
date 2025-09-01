import React, { useState } from 'react';
import { useMovies } from '../hooks/useMovies';
import type { Movie } from '../types';
import { Search, Plus, Star, Calendar, Clock } from 'lucide-react';

const Discover: React.FC = () => {
  const { addMovieToList } = useMovies();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');

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
      voteCount: 28947,
      genreIds: [28, 80, 18],
      genres: ['Action', 'Crime', 'Drama'],
      runtime: 152,
      status: 'plan_to_watch',
      addedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'discover-4',
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
      addedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'discover-5',
      title: 'Fight Club',
      overview: 'A nameless first person narrator attends support groups in attempt to subdue his emotional state and relieve his insomnia.',
      posterPath: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdropPath: 'https://image.tmdb.org/t/p/original/52AfXWuXCHn3UjD17rBruA9f5qb.jpg',
      releaseDate: '1999-10-15',
      voteAverage: 8.8,
      voteCount: 21567,
      genreIds: [18],
      genres: ['Drama'],
      runtime: 139,
      status: 'plan_to_watch',
      addedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'discover-6',
      title: 'Forrest Gump',
      overview: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
      posterPath: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
      backdropPath: 'https://image.tmdb.org/t/p/original/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
      releaseDate: '1994-07-06',
      voteAverage: 8.8,
      voteCount: 19876,
      genreIds: [12, 18],
      genres: ['Adventure', 'Drama'],
      runtime: 142,
      status: 'plan_to_watch',
      addedAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const genres = [
    { id: 'all', name: 'All Genres' },
    { id: 'action', name: 'Action' },
    { id: 'drama', name: 'Drama' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'thriller', name: 'Thriller' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'horror', name: 'Horror' },
    { id: 'romance', name: 'Romance' },
  ];

  const sortOptions = [
    { id: 'rating', name: 'Rating', icon: Star },
    { id: 'year', name: 'Year', icon: Calendar },
    { id: 'title', name: 'Title', icon: Clock },
  ];

  const getFilteredMovies = () => {
    let filtered = popularMovies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie =>
        movie.genres.some(genre => genre.toLowerCase().includes(selectedGenre))
      );
    }

    // Sort
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
  };

  const filteredMovies = getFilteredMovies();

  const handleAddMovie = (movie: Movie) => {
    const newMovie: Movie = {
      ...movie,
      id: `user-${Date.now()}`,
      status: 'plan_to_watch',
      addedAt: new Date(),
      updatedAt: new Date(),
    };
    addMovieToList(newMovie);
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Discover Movies
          </h1>
          <p className="text-text-secondary">
            Find and add new movies to your collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search movies by title or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  onChange={(e) => setSelectedGenre(e.target.value)}
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
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'year' | 'title')}
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

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Popular Movies
              {searchTerm && ` - "${searchTerm}"`}
            </h2>
            <span className="text-text-secondary">
              {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Movie Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No movies found
            </h3>
            <p className="text-text-secondary">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie, index) => (
              <div
                key={movie.id}
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
                      onClick={() => handleAddMovie(movie)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
