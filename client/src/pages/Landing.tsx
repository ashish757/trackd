import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Star, Users, TrendingUp, Play, ArrowRight, Plus } from 'lucide-react';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Film,
      title: 'Track Your Movies',
      description: 'Keep track of all the movies you\'ve watched, are watching, or plan to watch.',
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Rate your favorite films and add personal notes to remember what you loved.',
    },
    {
      icon: Users,
      title: 'Share Lists',
      description: 'Create and share your movie lists with friends and discover new films.',
    },
    {
      icon: TrendingUp,
      title: 'Discover Trends',
      description: 'Get personalized recommendations based on your watching history.',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Movies Tracked' },
    { number: '5K+', label: 'Active Users' },
    { number: '50K+', label: 'Reviews Posted' },
    { number: '100+', label: 'Countries' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-yellow-500/5 opacity-20"></div>
        </div>

        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between py-20 lg:py-32">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">Get Your Cinematic Journey <span className="text-gradient">Trackd</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Discover, track, and share your favorite movies. Build your personal movie library 
                and never lose track of what you've watched or want to watch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="btn btn-primary btn-lg"
                >
                  <Play className="h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/discover"
                  className="btn btn-secondary btn-lg"
                >
                  Explore More
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                {/* Movie Dashboard Mockup */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 max-w-md shadow-2xl border border-gray-800">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Film className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white font-semibold">My Movies</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg p-3 text-center">
                      <div className="text-red-400 text-xs font-medium">Watching</div>
                      <div className="text-white text-lg font-bold">12</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-3 text-center">
                      <div className="text-green-400 text-xs font-medium">Completed</div>
                      <div className="text-white text-lg font-bold">89</div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg p-3 text-center">
                      <div className="text-yellow-400 text-xs font-medium">Planned</div>
                      <div className="text-white text-lg font-bold">24</div>
                    </div>
                  </div>

                  {/* Movie List */}
                  <div className="space-y-3">
                    {[
                      { title: 'Inception', year: '2010', rating: 5, status: 'completed' },
                      { title: 'The Dark Knight', year: '2008', rating: 5, status: 'completed' },
                      { title: 'Interstellar', year: '2014', rating: 4, status: 'watching' },
                    ].map((movie, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg"
                        style={{
                          animationDelay: `${(index + 3) * 0.1}s`,
                          animation: 'fadeIn 0.6s ease-out forwards',
                          opacity: 0,
                        }}
                      >
                        <div className="w-10 h-14 bg-gradient-to-br from-red-500 to-yellow-500 rounded flex items-center justify-center">
                          <Film className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{movie.title}</div>
                          <div className="text-gray-400 text-xs">{movie.year}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(movie.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          movie.status === 'completed' ? 'bg-green-400' : 
                          movie.status === 'watching' ? 'bg-red-400' : 'bg-yellow-400'
                        }`}></div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Movie</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'slideUp 0.6s ease-out forwards',
                  opacity: 0,
                }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Track Movies
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features to help you organize your movie collection and discover new films.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card text-center hover:transform hover:scale-105 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeIn 0.6s ease-out forwards',
                    opacity: 0,
                  }}
                >
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-yellow-500">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Start Your Movie Journey?
          </h2>
          <p className="text-xl mb-8 text-white opacity-90 max-w-2xl mx-auto">
            Join thousands of movie enthusiasts who are already tracking their favorite films.
          </p>
          <Link
            to="/signup"
            className="btn bg-white text-red-500 hover:bg-gray-100 text-lg px-8 py-4"
          >
            <Play className="h-5 w-5" />
            Start Tracking Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
