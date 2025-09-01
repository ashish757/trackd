import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMovies } from '../hooks/useMovies';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Film, 
  Star, 
  Calendar,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { movies, watchlist, completed, planToWatch } = useMovies();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const stats = [
    {
      icon: Film,
      label: 'Total Movies',
      value: movies.length,
      color: 'text-primary-color',
    },
    {
      icon: Clock,
      label: 'Watching',
      value: watchlist.length,
      color: 'text-accent-color',
    },
    {
      icon: Award,
      label: 'Completed',
      value: completed.length,
      color: 'text-success-color',
    },
    {
      icon: TrendingUp,
      label: 'Plan to Watch',
      value: planToWatch.length,
      color: 'text-warning-color',
    },
  ];

  const averageRating = completed.length > 0 
    ? (completed.reduce((sum, movie) => sum + (movie.rating || 0), 0) / completed.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary-color rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="input resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="btn btn-primary"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-secondary"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-text-primary">
                      {user?.name}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-background-tertiary rounded-full hover:bg-border-color transition-colors"
                      title="Edit profile"
                    >
                      <Edit3 className="h-4 w-4 text-text-secondary" />
                    </button>
                  </div>
                  <p className="text-text-secondary">
                    @{user?.username}
                  </p>
                  {user?.bio && (
                    <p className="text-text-primary max-w-md">
                      {user.bio}
                    </p>
                  )}
                  <p className="text-sm text-text-muted">
                    Member since {user?.createdAt.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card text-center"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeIn 0.6s ease-out forwards',
                  opacity: 0,
                }}
              >
                <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Average Rating */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="h-6 w-6 text-accent-color" />
              <h3 className="text-lg font-semibold text-text-primary">
                Average Rating
              </h3>
            </div>
            <div className="text-3xl font-bold text-accent-color mb-2">
              {averageRating}
            </div>
            <p className="text-sm text-text-secondary">
              Based on {completed.filter(m => m.rating).length} rated movies
            </p>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-primary-color" />
              <h3 className="text-lg font-semibold text-text-primary">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-2">
              {movies
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 3)
                .map((movie) => (
                  <div key={movie.id} className="flex items-center space-x-3">
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-8 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {movie.title}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {movie.status.replace('_', ' ')} • {new Date(movie.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Movie Collections */}
        <div className="space-y-6">
          {/* Watching */}
          {watchlist.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-accent-color" />
                <span>Currently Watching</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchlist.slice(0, 6).map((movie) => (
                  <div key={movie.id} className="relative">
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-accent-color rounded-full text-xs font-medium text-background-primary">
                      Watching
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Completed */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5 text-success-color" />
                <span>Recently Completed</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {completed.slice(0, 6).map((movie) => (
                  <div key={movie.id} className="relative">
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-success-color rounded-full text-xs font-medium text-background-primary">
                      {movie.rating}/5
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
