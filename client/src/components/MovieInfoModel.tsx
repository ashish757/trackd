import { X, Calendar, Star, Film, Check, Clock, Users, Clapperboard, DollarSign, Globe, Heart, Tv, ChevronDown, ChevronUp } from 'lucide-react'
import type { SeasonDetails, Episode } from "../redux/movie/movieApi.ts";
import Portal from "./Portal.tsx";
import { useMarkMovieMutation, useUnmarkMovieMutation, useGetMovieEntryQuery, MovieStatus, useRateMovieMutation, useGetUserMovieRatingQuery, useRemoveRatingMutation, useToggleFavoriteMutation } from '../redux/userMovie/userMovieApi';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGetMovieByIdQuery, useLazyGetSeasonDetailsQuery } from '../redux/movie/movieApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import StarRating from './StarRating';

const MovieInfoModel = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const movieId = searchParams.get('movie');
    const mediaType = searchParams.get('mediaType') as 'movie' | 'tv' | null;
    const scrollPositionRef = useRef<number>(0);

    // Fetch movie/TV show details from URL params
    const { data: movie } = useGetMovieByIdQuery(
        { id: Number(movieId), mediaType: mediaType || undefined },
        { skip: !movieId }
    );

    const onClose = useCallback(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('movie');
        newParams.delete('mediaType');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);
    const location = useLocation();

    const [markMovie, { isLoading: isMarking }] = useMarkMovieMutation();
    const [unmarkMovie, { isLoading: isUnmarking }] = useUnmarkMovieMutation();
    const [rateMovie, { isLoading: isRating }] = useRateMovieMutation();
    const [removeRatingMutation, { isLoading: isRemovingRating }] = useRemoveRatingMutation();
    const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();

    const { data: movieEntryData, isLoading: isLoadingEntry } = useGetMovieEntryQuery(movie?.id || 0, {
        skip: !movie?.id || !isAuthenticated || !isInitialized,
    });

    const { data: userRatingData, isLoading: isLoadingRating } = useGetUserMovieRatingQuery(movie?.id || 0, {
        skip: !movie?.id || !isAuthenticated || !isInitialized,
    });

    // Fetch detailed movie info
    const { data: detailedMovieData, isLoading: isLoadingDetails } = useGetMovieByIdQuery(
        { id: movie?.id || 0, mediaType: movie?.media_type as 'movie' | 'tv' | undefined },
        { skip: !movie?.id }
    );

    const [error, setError] = useState<string | null>(null);
    const [userRating, setUserRating] = useState<number>(0);
    const [showSeasons, setShowSeasons] = useState<boolean>(false);
    const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
    const [seasonDetailsCache, setSeasonDetailsCache] = useState<Record<number, SeasonDetails>>({});

    const [getSeasonDetails, { isLoading: isLoadingSeasonDetails }] = useLazyGetSeasonDetailsQuery();

    // Update user rating when data is fetched
    useEffect(() => {
        if (userRatingData?.data?.rating) {
            setUserRating(userRatingData.data.rating);
        } else {
            setUserRating(0);
        }
    }, [userRatingData]);

    // Prevent body scroll when modal is open and preserve scroll position
    useEffect(() => {
        if (!movieId) return;

        // Store current scroll position
        scrollPositionRef.current = window.scrollY;

        // Store original overflow and position values
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalWidth = document.body.style.width;

        // Lock body scroll and maintain scroll position
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPositionRef.current}px`;
        document.body.style.width = '100%';

        // Cleanup: restore original values and scroll position when modal closes
        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = originalWidth;

            // Restore scroll position
            window.scrollTo(0, scrollPositionRef.current);
        };
    }, [movieId]);

    // Handle ESC key to close modal
    useEffect(() => {
        if (!movieId) return;

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [movieId, onClose]);

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
        movieDetails?.credits?.cast?.slice(0, 10) || [],
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

    const handleToggleSeason = useCallback(async (seasonNumber: number) => {
        if (!movie) return;

        const newExpandedSeasons = new Set(expandedSeasons);

        if (newExpandedSeasons.has(seasonNumber)) {
            // Collapse the season
            newExpandedSeasons.delete(seasonNumber);
            setExpandedSeasons(newExpandedSeasons);
        } else {
            // Expand the season
            newExpandedSeasons.add(seasonNumber);
            setExpandedSeasons(newExpandedSeasons);

            // Fetch episode details if not already cached
            if (!seasonDetailsCache[seasonNumber]) {
                try {
                    const result = await getSeasonDetails({ tvId: movie.id, seasonNumber }).unwrap();
                    setSeasonDetailsCache(prev => ({
                        ...prev,
                        [seasonNumber]: result
                    }));
                } catch (err) {
                    console.error('Error fetching season details:', err);
                }
            }
        }
    }, [movie, expandedSeasons, seasonDetailsCache, getSeasonDetails]);

    if (!movieId || !movie) return null;

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

                            {/* Runtime - Show episode runtime for TV shows, movie runtime for movies */}
                            {(movieDetails?.runtime || movieDetails?.episode_run_time?.[0]) && (
                                <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs md:text-sm font-semibold text-purple-800 dark:text-purple-300">
                                        {movieDetails.media_type === 'tv' && movieDetails.episode_run_time?.[0]
                                            ? `${movieDetails.episode_run_time[0]}m/ep`
                                            : formatRuntime(movieDetails.runtime)}
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

                        {/* TV Show Specific Information */}
                        {movieDetails?.media_type === 'tv' && (movieDetails.number_of_seasons || movieDetails.number_of_episodes) && (
                            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tv className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="text-sm md:text-base font-semibold text-indigo-900 dark:text-indigo-100">
                                        TV Show Information
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    {movieDetails.number_of_seasons && (
                                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Seasons</p>
                                            <p className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {movieDetails.number_of_seasons}
                                            </p>
                                        </div>
                                    )}
                                    {movieDetails.number_of_episodes && (
                                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Episodes</p>
                                            <p className="text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                                {movieDetails.number_of_episodes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* View All Seasons Button */}
                                {movieDetails.seasons && movieDetails.seasons.length > 0 && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => setShowSeasons(!showSeasons)}
                                            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 text-sm md:text-base font-medium flex items-center justify-center gap-2"
                                        >
                                            {showSeasons ? (
                                                <>
                                                    <ChevronUp className="w-4 h-4" />
                                                    Hide Seasons & Episodes
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="w-4 h-4" />
                                                    View Seasons & Episodes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Expandable Seasons Section */}
                                {showSeasons && movieDetails.seasons && movieDetails.seasons.length > 0 && (
                                    <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                        {movieDetails.seasons
                                            .filter(season => season.season_number > 0)
                                            .map((season) => {
                                                const isExpanded = expandedSeasons.has(season.season_number);
                                                const seasonDetails = seasonDetailsCache[season.season_number];

                                                return (
                                            <div
                                                key={season.id}
                                                className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all"
                                            >
                                                {/* Season Header - Clickable */}
                                                <button
                                                    onClick={() => handleToggleSeason(season.season_number)}
                                                    className="w-full p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors text-left"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                                                                    {season.name}
                                                                </h4>
                                                                {season.vote_average && season.vote_average > 0 ? (
                                                                    <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                                        <Star className="w-3 h-3 fill-current" />
                                                                        {season.vote_average.toFixed(1)}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                                <span>{season.episode_count} episodes</span>
                                                                {season.air_date && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{new Date(season.air_date).getFullYear()}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Episodes List */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-200 dark:border-gray-700">
                                                        {isLoadingSeasonDetails && !seasonDetails ? (
                                                            <div className="p-6 flex items-center justify-center gap-2">
                                                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">Loading episodes...</span>
                                                            </div>
                                                        ) : seasonDetails?.episodes ? (
                                                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                                                {seasonDetails.episodes.map((episode: Episode) => (
                                                                    <div
                                                                        key={episode.id}
                                                                        className="p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                                                    {episode.episode_number}.
                                                                                </span>{' '}
                                                                                {episode.name}
                                                                            </h5>
                                                                            {episode.vote_average && episode.vote_average > 0 ? (
                                                                                <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 shrink-0">
                                                                                    <Star className="w-3 h-3 fill-current" />
                                                                                    {episode.vote_average.toFixed(1)}
                                                                                </span>
                                                                            ) : null}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                                            {episode.air_date && (
                                                                                <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                                                                            )}
                                                                            {episode.runtime && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span>{episode.runtime}m</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        {episode.overview && (
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                                {episode.overview}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                                                No episode information available
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )})}
                                    </div>
                                )}

                                {movieDetails.in_production !== undefined && (
                                    <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800/30">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Status: <span className={`font-semibold ${movieDetails.in_production ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {movieDetails.in_production ? 'In Production' : 'Ended'}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Rating Section - Only show for authenticated users */}
                        {!isInitialized ? (
                            // Skeleton while checking auth
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3"></div>
                                <div className="flex gap-1">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        ) : isAuthenticated && (
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



                        {/* Action Buttons - Show skeleton while checking auth, then show for authenticated users */}
                        {!isInitialized ? (
                            // Skeleton for action buttons
                            <div className="flex flex-col gap-3 py-4 mb-4 border-y border-gray-200 dark:border-gray-700 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="flex-1 h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div className="flex-1 h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                </div>
                                <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                        ) : isAuthenticated ? (
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

                        {/* Director (for Movies) */}
                        {director && movieDetails?.media_type !== 'tv' && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Clapperboard className="w-4 h-4" />
                                    Director
                                </h3>
                                <p className="text-gray-900 dark:text-white font-medium">{director.name}</p>
                            </div>
                        )}

                        {/* Creator (for TV Shows) */}
                        {movieDetails?.media_type === 'tv' && movieDetails.created_by && movieDetails.created_by.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                                    <Clapperboard className="w-4 h-4" />
                                    {movieDetails.created_by.length > 1 ? 'Creators' : 'Creator'}
                                </h3>
                                <p className="text-gray-900 dark:text-white font-medium">
                                    {movieDetails.created_by.map((creator) => creator.name).join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Cast */}
                        {topCast.length > 0 ? (
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
                        ): null}

                        {/* Networks (for TV Shows) */}
                        {movieDetails?.media_type === 'tv' && movieDetails.networks && movieDetails.networks.length > 0 ? (
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                    <Tv className="w-4 h-4" />
                                    {movieDetails.networks.length > 1 ? 'Networks' : 'Network'}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {movieDetails.networks.map(network => (
                                        <div key={network.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 px-3">
                                            {network.logo_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                                                    alt={network.name}
                                                    className="h-6 object-contain"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {network.name}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ): null}

                        {/* Additional Info */}
                        {(movieDetails?.budget || movieDetails?.revenue || movieDetails?.original_language) && (
                            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                {movieDetails?.budget && movieDetails.budget > 0 ? (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Budget
                                        </h4>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {formatMoney(movieDetails.budget)}
                                        </p>
                                    </div>
                                ): null}
                                {movieDetails?.revenue && movieDetails.revenue > 0 ? (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Revenue
                                        </h4>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                                            {formatMoney(movieDetails.revenue)}
                                        </p>
                                    </div>
                                ) : null}
                                {movieDetails?.original_language ? (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            Language
                                        </h4>
                                        <p className="text-sm text-gray-900 dark:text-white font-medium uppercase">
                                            {movieDetails.original_language}
                                        </p>
                                    </div>
                                ): null}
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

