import { X, Calendar, Star, Film, Check, Clock, Users, Clapperboard, DollarSign, Globe } from 'lucide-react'
import type {Movie} from "../redux/movie/movieApi.ts";
import Portal from "./Portal.tsx";
import { useMarkMovieMutation, useRemoveMovieMutation, useGetMovieEntryQuery, MovieStatus } from '../redux/userMovie/userMovieApi';
import { useState, useEffect } from 'react';
import { useGetMovieByIdQuery } from '../redux/movie/movieApi';

interface props {
    movie: Movie | null,
    onClose: (a: boolean) => void
}

const MovieInfoModel = ({onClose, movie}: props) => {
    const [markMovie, { isLoading: isMarking }] = useMarkMovieMutation();
    const [removeMovie, { isLoading: isRemoving }] = useRemoveMovieMutation();
    const { data: movieEntryData, isLoading: isLoadingEntry } = useGetMovieEntryQuery(movie?.id || 0, {
        skip: !movie?.id,
    });

    // Fetch detailed movie info
    const { data: detailedMovieData, isLoading: isLoadingDetails } = useGetMovieByIdQuery(movie?.id || 0, {
        skip: !movie?.id,
    });

    const [error, setError] = useState<string | null>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        // Store original overflow value
        const originalOverflow = document.body.style.overflow;

        // Lock body scroll
        document.body.style.overflow = 'hidden';

        // Cleanup: restore original overflow when modal closes
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Use detailed movie data if available, otherwise fallback to basic movie data
    const movieDetails = detailedMovieData || movie;

    if (!movie) return null;

    const imageUrl = movieDetails?.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
        : null;

    const backdropUrl = movieDetails?.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`
        : null;

    const releaseYear = movieDetails?.release_date
        ? new Date(movieDetails.release_date).getFullYear()
        : 'N/A';

    const rating = movieDetails?.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A';

    const currentStatus = movieEntryData?.data?.status;

    // Get director from crew
    const director = movieDetails?.credits?.crew?.find(person => person.job === 'Director');

    // Get top cast members (first 5)
    const topCast = movieDetails?.credits?.cast?.slice(0, 5) || [];

    // Format runtime
    const formatRuntime = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Format budget/revenue
    const formatMoney = (amount?: number) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleMarkMovie = async (status: MovieStatus) => {
        try {
            setError(null);
            await markMovie({ movieId: movie.id, status }).unwrap();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to update movie status';
            setError(errorMessage);
            console.error('Error marking movie:', err);
        }
    };

    const handleRemoveMovie = async () => {
        try {
            setError(null);
            await removeMovie(movie.id).unwrap();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to remove movie';
            setError(errorMessage);
            console.error('Error removing movie:', err);
        }
    };

    const isProcessing = isMarking || isRemoving || isLoadingEntry;

    return (
        <Portal layer={"modal"}>
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => onClose(false)}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl animate-in fade-in duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => onClose(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors duration-200"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Backdrop Image Header */}
                {backdropUrl && (
                    <div className="relative w-full min-h-64  rounded-t-2xl">
                        <img
                            src={backdropUrl}
                            alt={movieDetails?.title}
                            className="w-full h-64 object-cover"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-white dark:from-gray-800 to-transparent"></div>
                    </div>
                )}

                <div className={`flex flex-col md:flex-row p-6 md:p-8 gap-6 ${backdropUrl ? 'relative -translate-y-20 md:-translate-y-24' : ''} `}>
                    {/* Movie Poster */}
                    <div className={`md:w-1/3 shrink-0 ${backdropUrl ? 'relative -translate-y-20 md:-translate-y-24' : ''}`}>

                        <div className={`bg-gray-200 dark:bg-gray-700 rounded-xl shadow-xl`}>

                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={movieDetails?.title}
                                    className="w-full h-auto object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-2/3 flex items-center justify-center">
                                    <Film className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Movie Details */}
                    <div className={`md:w-2/3 flex flex-col `}>
                        {/* Title */}
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {movieDetails?.title}
                        </h2>

                        {/* Tagline */}
                        {movieDetails?.tagline && (
                            <p className="text-gray-600 dark:text-gray-400 italic mb-4">
                                "{movieDetails.tagline}"
                            </p>
                        )}

                        {/* Meta Information */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {/* Rating */}
                            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full">
                                <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-500 fill-yellow-600 dark:fill-yellow-500" />
                                <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                    {rating}
                                    {movieDetails?.vote_count && (
                                        <span className="text-xs ml-1">({movieDetails.vote_count.toLocaleString()})</span>
                                    )}
                                </span>
                            </div>

                            {/* Release Year */}
                            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                    {releaseYear}
                                </span>
                            </div>

                            {/* Runtime */}
                            {movieDetails?.runtime && (
                                <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
                                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                                        {formatRuntime(movieDetails.runtime)}
                                    </span>
                                </div>
                            )}

                            {/* Status */}
                            {movieDetails?.status && (
                                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                                        {movieDetails.status}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Genres */}
                        {movieDetails?.genres && movieDetails.genres.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                    Genres
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {movieDetails.genres.map(genre => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Overview */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Overview
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {movieDetails?.overview || 'No overview available for this movie.'}
                            </p>
                        </div>

                        {/* Loading State */}
                        {isLoadingDetails && (
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-3">
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="text-sm text-blue-700 dark:text-blue-300">Loading detailed information...</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons - Moved higher */}
                        <div className="flex flex-col gap-3 py-4 mb-4 border-y border-gray-200 dark:border-gray-700">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleMarkMovie(MovieStatus.WATCHED)}
                                    disabled={isProcessing || currentStatus === MovieStatus.WATCHED}
                                    className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ${
                                        currentStatus === MovieStatus.WATCHED
                                            ? 'bg-green-600 text-white cursor-default'
                                            : 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Check className="w-5 h-5" />
                                    {currentStatus === MovieStatus.WATCHED ? 'Watched' : 'Mark as Watched'}
                                </button>
                                <button
                                    onClick={() => handleMarkMovie(MovieStatus.PLANNED)}
                                    disabled={isProcessing || currentStatus === MovieStatus.PLANNED}
                                    className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ${
                                        currentStatus === MovieStatus.PLANNED
                                            ? 'bg-blue-600 text-white cursor-default'
                                            : 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Clock className="w-5 h-5" />
                                    {currentStatus === MovieStatus.PLANNED ? 'Planned' : 'Plan to Watch'}
                                </button>
                            </div>

                            {/* Remove Button - Only show if movie is marked */}
                            {currentStatus && (
                                <button
                                    onClick={handleRemoveMovie}
                                    disabled={isProcessing}
                                    className="w-full bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Remove from My Movies
                                </button>
                            )}
                        </div>

                        {/* Director */}
                        {director && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Clapperboard className="w-4 h-4" />
                                    Director
                                </h3>
                                <p className="text-gray-900 dark:text-white font-medium">{director.name}</p>
                            </div>
                        )}

                        {/* Cast */}
                        {topCast.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Top Cast
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {topCast.map(actor => (
                                        <div key={actor.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 pr-3">
                                            {actor.profile_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                                                    alt={actor.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900 dark:text-white">{actor.name}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">{actor.character}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        {(movieDetails?.budget || movieDetails?.revenue || movieDetails?.original_language) && (
                            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                {movieDetails?.budget && movieDetails.budget > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Budget
                                        </h4>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {formatMoney(movieDetails.budget)}
                                        </p>
                                    </div>
                                )}
                                {movieDetails?.revenue && movieDetails.revenue > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Revenue
                                        </h4>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {formatMoney(movieDetails.revenue)}
                                        </p>
                                    </div>
                                )}
                                {movieDetails?.original_language && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            Language
                                        </h4>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium uppercase">
                                            {movieDetails.original_language}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </Portal>

    );
};

export default MovieInfoModel;