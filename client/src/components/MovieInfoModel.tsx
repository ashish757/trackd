import { X, Calendar, Star, Film, Check, Clock, Users, Clapperboard, DollarSign, Globe, Heart } from 'lucide-react'
import type {Movie} from "../redux/movie/movieApi.ts";
import Portal from "./Portal.tsx";
import { useMarkMovieMutation, useUnmarkMovieMutation, useGetMovieEntryQuery, MovieStatus, useRateMovieMutation, useGetUserMovieRatingQuery, useRemoveRatingMutation, useToggleFavoriteMutation } from '../redux/userMovie/userMovieApi';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetMovieByIdQuery } from '../redux/movie/movieApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { Link, useLocation } from 'react-router-dom';
import StarRating from './StarRating';

interface props {
    movie: Movie | null,
    onClose: () => void
}const MovieInfoModel = ({onClose, movie}: props) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const location = useLocation();

    const [markMovie, { isLoading: isMarking }] = useMarkMovieMutation();
    const [unmarkMovie, { isLoading: isUnmarking }] = useUnmarkMovieMutation();
    const [rateMovie, { isLoading: isRating }] = useRateMovieMutation();
    const [removeRatingMutation, { isLoading: isRemovingRating }] = useRemoveRatingMutation();
    const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();

    const { data: movieEntryData, isLoading: isLoadingEntry } = useGetMovieEntryQuery(movie?.id || 0, {
        skip: !movie?.id || !isAuthenticated,
    });

    const { data: userRatingData, isLoading: isLoadingRating } = useGetUserMovieRatingQuery(movie?.id || 0, {
        skip: !movie?.id || !isAuthenticated,
    });

    // Fetch detailed movie info
    const { data: detailedMovieData, isLoading: isLoadingDetails } = useGetMovieByIdQuery(movie?.id || 0, {
        skip: !movie?.id,
    });

    const [error, setError] = useState<string | null>(null);
    const [userRating, setUserRating] = useState<number>(0);

    // Update user rating when data is fetched
    useEffect(() => {
        if (userRatingData?.data?.rating) {
            setUserRating(userRatingData.data.rating);
        } else {
            setUserRating(0);
        }
    }, [userRatingData]);

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
    const movieDetails = useMemo(() => detailedMovieData || movie, [detailedMovieData, movie]);

    // Memoize computed values
    const imageUrl = useMemo(() =>
        movieDetails?.poster_path
            ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
            : null,
        [movieDetails?.poster_path]
    );

    const backdropUrl = useMemo(() =>
        movieDetails?.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`
            : null,
        [movieDetails?.backdrop_path]
    );

    const releaseYear = useMemo(() =>
        movieDetails?.release_date
            ? new Date(movieDetails.release_date).getFullYear()
            : 'N/A',
        [movieDetails?.release_date]
    );

    const rating = useMemo(() =>
        movieDetails?.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A',
        [movieDetails?.vote_average]
    );

    const currentStatus = useMemo(() => movieEntryData?.data?.status, [movieEntryData?.data?.status]);
    const isFavorite = useMemo(() => movieEntryData?.data?.isFavorite || false, [movieEntryData?.data?.isFavorite]);

    // Get director from crew
    const director = useMemo(() =>
        movieDetails?.credits?.crew?.find(person => person.job === 'Director'),
        [movieDetails?.credits?.crew]
    );

    // Get top cast members (first 5)
    const topCast = useMemo(() =>
        movieDetails?.credits?.cast?.slice(0, 5) || [],
        [movieDetails?.credits?.cast]
    );

    const isProcessing = useMemo(() =>
        isMarking || isUnmarking || isLoadingEntry || isRating || isRemovingRating || isTogglingFavorite,
        [isMarking, isUnmarking, isLoadingEntry, isRating, isRemovingRating, isTogglingFavorite]
    );

    // Format runtime
    const formatRuntime = useCallback((minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }, []);

    // Format budget/revenue
    const formatMoney = useCallback((amount?: number) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    }, []);

    const handleMarkMovie = useCallback(async (status: MovieStatus) => {
        if (!movie) return;
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
    }, [markMovie, movie]);

    const handleUnmarkMovie = useCallback(async (status: string) => {
        if (!movie) return;
        try {
            setError(null);
            await unmarkMovie({moviesId: movie.id, status}).unwrap();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to remove movie';
            setError(errorMessage);
            console.error('Error removing movie:', err);
        }
    }, [unmarkMovie, movie]);

    const handleRateMovie = useCallback(async (rating: number) => {
        if (!movie) return;

        // Frontend validation
        if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
            setError('Rating must be an integer between 1 and 10');
            return;
        }

        // Store previous rating for rollback
        const previousRating = userRating;

        try {
            setError(null);
            // Optimistic update - update UI immediately
            setUserRating(rating);

            // Make API call
            await rateMovie({ movieId: movie.id, rating }).unwrap();
            // Success - optimistic update is already applied
        } catch (err: unknown) {
            // Rollback on error
            setUserRating(previousRating);

            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to rate movie';
            setError(errorMessage);
            console.error('Error rating movie:', err);
        }
    }, [rateMovie, movie, userRating]);

    const handleRemoveRating = useCallback(async () => {
        if (!movie) return;
        // Store previous rating for rollback
        const previousRating = userRating;

        try {
            setError(null);
            // Optimistic update - update UI immediately
            setUserRating(0);

            // Make API call
            await removeRatingMutation(movie.id).unwrap();
            // Success - optimistic update is already applied
        } catch (err: unknown) {
            // Rollback on error
            setUserRating(previousRating);

            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to remove rating';
            setError(errorMessage);
            console.error('Error removing rating:', err);
        }
    }, [removeRatingMutation, movie, userRating]);

    const handleToggleFavorite = useCallback(async () => {
        if (!movie) return;
        try {
            setError(null);
            await toggleFavorite(movie.id).unwrap();
        } catch (err: unknown) {
            const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
                ? String(err.data.message)
                : 'Failed to toggle favorite';
            setError(errorMessage);
            console.error('Error toggling favorite:', err);
        }
    }, [toggleFavorite, movie]);

    if (!movie) return null;

    return (
        <Portal layer={"modal"}>
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center md:items-start justify-center z-50 md:p-4 overflow-y-auto"
            onClick={() => onClose()}
        >
            <div
                className="bg-white dark:bg-gray-800 md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-4xl animate-in fade-in duration-200 relative overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => onClose()}
                    className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors duration-200"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Backdrop Image Header */}
                {backdropUrl && (
                    <div className="relative w-full h-48 md:min-h-64 md:rounded-t-2xl">
                        <img
                            src={backdropUrl}
                            alt={movieDetails?.title}
                            className="w-full h-48 md:h-64 object-cover"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-white dark:from-gray-800 to-transparent"></div>
                    </div>
                )}

                <div className={`flex flex-col md:flex-row p-4 md:p-6 lg:p-8 gap-4 md:gap-6 ${backdropUrl ? 'relative -translate-y-16 md:-translate-y-20 lg:-translate-y-24' : ''} `}>
                    {/* Movie Poster */}
                    <div className={`md:w-1/3 shrink-0 ${backdropUrl ? 'relative -translate-y-12 md:-translate-y-20 lg:-translate-y-24' : ''}`}>

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
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {movieDetails?.title}
                        </h2>

                        {/* Tagline */}
                        {movieDetails?.tagline && (
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 italic mb-3 md:mb-4">
                                "{movieDetails.tagline}"
                            </p>
                        )}

                        {/* Meta Information */}
                        <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
                            {/* Rating */}
                            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                                <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-600 dark:text-yellow-500 fill-yellow-600 dark:fill-yellow-500" />
                                <span className="text-xs md:text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                    {rating}
                                    {movieDetails?.vote_count && (
                                        <span className="text-xs ml-1">({movieDetails.vote_count.toLocaleString()})</span>
                                    )}
                                </span>
                            </div>

                            {/* Release Year */}
                            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-300">
                                    {releaseYear}
                                </span>
                            </div>

                            {/* Runtime */}
                            {movieDetails?.runtime && (
                                <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs md:text-sm font-semibold text-purple-800 dark:text-purple-300">
                                        {formatRuntime(movieDetails.runtime)}
                                    </span>
                                </div>
                            )}

                            {/* Status */}
                            {movieDetails?.status && (
                                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                                    <span className="text-xs md:text-sm font-semibold text-green-800 dark:text-green-300">
                                        {movieDetails.status}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* User Rating Section - Only show for authenticated users */}
                        {isAuthenticated && (
                            <div className="mb-6 p-4 bg-linear-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
                                <div className="flex items-center justify-between mb-3">
                                    {userRating > 0 && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Click on stars to update your rating
                                        </p>
                                    )}
                                    {userRating === 0 && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Click on stars to Rate this movie
                                        </p>
                                    )}
                                    {userRating > 0 && (
                                        <button
                                            onClick={handleRemoveRating}
                                            disabled={isRemovingRating}
                                            className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                                        >
                                            {isRemovingRating ? 'Removing...' : 'Remove'}
                                        </button>
                                    )}
                                </div>



                                {isLoadingRating ? (
                                    <div className="flex items-center gap-2">
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Loading your rating...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <StarRating
                                            rating={userRating}
                                            onRatingChange={handleRateMovie}
                                            maxRating={10}
                                            size={28}
                                            readonly={isRating}
                                        />

                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

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



                        {/* Action Buttons - Only show for authenticated users */}
                        {isAuthenticated ? (
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
                                    <button
                                        onClick={handleToggleFavorite}
                                        disabled={isProcessing}
                                        className={`flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ${
                                            isFavorite
                                                ? 'bg-pink-600 text-white'
                                                : 'bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-pink-900/30 dark:hover:bg-pink-900/50 dark:text-pink-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                {/* Remove Button - Only show if movie is marked */}
                                {currentStatus && (
                                    <button
                                        onClick={() => handleUnmarkMovie(currentStatus)}
                                        disabled={isProcessing}
                                        className="w-full bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Remove from My Movies
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Show sign in prompt for unauthenticated users */
                            <div className="flex flex-col gap-3 py-4 mb-4 border-y border-gray-200 dark:border-gray-700">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        Sign in to track this movie in your list
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <Link
                                            to={`/signin?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to={`/signup?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 font-semibold rounded-lg transition-colors"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

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

