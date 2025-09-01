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
  Search,
  Activity
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
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-primary-color bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto">
            <Film className="h-10 w-10 text-primary-color" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              Welcome to Trackd
            </h1>
            <p className="text-text-secondary text-lg">
              Sign in to start tracking your movies
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-10 mt-6">
          <h1 className="text-4xl font-bold text-text-primary mb-3">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-text-secondary text-lg">
            Here's your movie collection and recent activity
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                className={`card text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                  isActive 
                    ? 'border-primary-color border-2 shadow-md shadow-primary-color/20' 
                    : 'hover:shadow-md hover:bg-background-secondary border-border-color'
                }`}
                onClick={() => setActiveTab(tab.id as 'all' | 'watching' | 'completed' | 'plan')}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeIn 0.6s ease-out forwards',
                  opacity: 0,
                }}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary-color shadow-lg shadow-primary-color/25' 
                    : 'bg-primary-color bg-opacity-10 hover:bg-primary-color hover:bg-opacity-20'
                }`}>
                  <Icon className={`h-8 w-8 ${isActive ? 'text-white' : 'text-primary-color'}`} />
                </div>
                <div className={`text-3xl font-bold mb-2 ${isActive ? 'text-primary-color' : 'text-text-primary'}`}>
                  {tab.count}
                </div>
                <div className={`text-sm font-medium ${isActive ? 'text-primary-color' : 'text-text-secondary'}`}>
                  {tab.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search Section */}
        <div className="card p-8 mb-10 bg-background-secondary border border-border-color shadow-lg">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-text-muted" />
              <input
                type="text"
                placeholder="Search movies by title or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-background-primary border border-border-color rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent transition-all duration-200 text-lg shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-color border-t-transparent mx-auto mb-6"></div>
            <p className="text-text-secondary text-lg">Loading your movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-primary-color bg-opacity-10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Film className="h-12 w-12 text-primary-color" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              {searchTerm ? 'No movies found' : 'No movies yet'}
            </h3>
            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or browse different categories'
                : 'Start building your movie collection by discovering and adding your favorite films'
              }
            </p>
            {!searchTerm && (
              <button className="btn btn-primary btn-lg inline-flex items-center gap-3 shadow-lg shadow-primary-color/25 hover:shadow-xl hover:shadow-primary-color/30 transition-all duration-300">
                <Plus className="h-5 w-5" />
                Add Your First Movie
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-primary">
                {activeTab === 'all' ? 'All Movies' : 
                 activeTab === 'watching' ? 'Currently Watching' :
                 activeTab === 'completed' ? 'Completed Movies' :
                 'Plan to Watch'}
                {searchTerm && ` - "${searchTerm}"`}
              </h2>
              <span className="text-text-secondary bg-background-secondary px-4 py-2 rounded-lg border border-border-color">
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

        {/* Activity */}
        {movies.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-text-primary mb-8 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-color rounded-xl flex items-center justify-center shadow-lg shadow-primary-color/25">
                <Activity className="h-5 w-5 text-white" />
              </div>
              Activity
            </h3>
            <div className="card p-6 bg-background-secondary border border-border-color">
              <div className="space-y-4">
                {movies
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 5)
                  .map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="flex items-center space-x-6 p-4 rounded-xl hover:bg-background-tertiary transition-all duration-200 border border-transparent hover:border-border-color group"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animation: 'fadeIn 0.6s ease-out forwards',
                        opacity: 0,
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={movie.posterPath}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                        />
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary-color rounded-full flex items-center justify-center shadow-lg">
                          <Film className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-text-primary text-lg truncate group-hover:text-primary-color transition-colors duration-200">
                          {movie.title}
                        </h4>
                        <p className="text-sm text-text-secondary mt-2 flex items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            movie.status === 'watching' 
                              ? 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500 border-opacity-30'
                              : movie.status === 'completed'
                              ? 'bg-green-500 bg-opacity-20 text-green-400 border-green-500 border-opacity-30'
                              : movie.status === 'plan_to_watch'
                              ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500 border-opacity-30'
                              : 'bg-red-500 bg-opacity-20 text-red-400 border-red-500 border-opacity-30'
                          }`}>
                            {movie.status === 'plan_to_watch' ? 'Plan to Watch' : movie.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-text-muted">•</span>
                          <span>{new Date(movie.updatedAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                      {movie.rating && (
                        <div className="flex items-center space-x-2 bg-background-primary px-4 py-3 rounded-xl border border-border-color shadow-sm">
                          <Star className="h-4 w-4 text-accent-color fill-current" />
                          <span className="text-sm font-bold text-text-primary">
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