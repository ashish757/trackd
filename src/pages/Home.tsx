import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMovies } from '../hooks/useMovies';
import MovieCard from '../components/MovieCard';
import { 
  Film, 
  Star, 
  Clock, 
  Award, 
  TrendingUp, 
  Plus,
  Search
} from 'lucide-react';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { movies, watchlist, completed, planToWatch, isLoading } = useMovies();
  const [activeTab, setActiveTab] = useState<'all' | 'watching' | 'completed' | 'plan'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'all', label: 'All Movies', count: movies.length, icon: Film },
    { id: 'watching', label: 'Watching', count: watchlist.length, icon: Clock },
    { id: 'completed', label: 'Completed', count: completed.length, icon: Award },
    { id: 'plan', label: 'Plan to Watch', count: planToWatch.length, icon: TrendingUp },
  ];

  const getFilteredMovies = () => {
    let filteredMovies = movies;

    // Filter by tab
    switch (activeTab) {
      case 'watching':
        filteredMovies = watchlist;
        break;
      case 'completed':
        filteredMovies = completed;
        break;
      case 'plan':
        filteredMovies = planToWatch;
        break;
      default:
        filteredMovies = movies;
    }

    // Filter by search term
    if (searchTerm) {
      filteredMovies = filteredMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filteredMovies;
  };

  const filteredMovies = getFilteredMovies();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <Film className="h-16 w-16 text-primary-color mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Welcome to Trackd
          </h1>
          <p className="text-text-secondary mb-6">
            Sign in to start tracking your movies
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-text-secondary">
            Here's your movie collection and recent activity
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.id}
                className="card text-center cursor-pointer hover:bg-background-tertiary transition-colors"
                onClick={() => setActiveTab(tab.id as 'all' | 'watching' | 'completed' | 'plan')}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeIn 0.6s ease-out forwards',
                  opacity: 0,
                }}
              >
                <div className="w-12 h-12 bg-primary-color bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-primary-color" />
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {tab.count}
                </div>
                <div className="text-sm text-text-secondary">
                  {tab.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search movies by title or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'all' | 'watching' | 'completed' | 'plan')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-color text-white'
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
            <p className="text-text-secondary mt-4">Loading your movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchTerm ? 'No movies found' : 'No movies yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start by adding some movies to your collection'
              }
            </p>
            {!searchTerm && (
              <button className="btn btn-primary">
                <Plus className="h-4 w-4" />
                Add Your First Movie
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                {activeTab === 'all' ? 'All Movies' : 
                 activeTab === 'watching' ? 'Currently Watching' :
                 activeTab === 'completed' ? 'Completed Movies' :
                 'Plan to Watch'}
                {searchTerm && ` - "${searchTerm}"`}
              </h2>
              <span className="text-text-secondary">
                {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Movie Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animation: 'fadeIn 0.6s ease-out forwards',
                    opacity: 0,
                  }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {movies.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-text-primary mb-6">
              Recent Activity
            </h3>
            <div className="card">
              <div className="space-y-4">
                {movies
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 5)
                  .map((movie) => (
                    <div key={movie.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-background-tertiary transition-colors">
                      <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">
                          {movie.title}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {movie.status.replace('_', ' ')} • {new Date(movie.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {movie.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-accent-color fill-current" />
                          <span className="text-sm font-medium text-text-primary">
                            {movie.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
