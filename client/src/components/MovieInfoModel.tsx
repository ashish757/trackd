import { X, Calendar, Star, Film, Check, Clock } from 'lucide-react'
import type {Movie} from "../redux/movie/movieApi.ts";
import Portal from "./Portal.tsx";
import { useMarkMovieMutation, useRemoveMovieMutation, useGetMovieEntryQuery, MovieStatus } from '../redux/userMovie/userMovieApi';
import { useState } from 'react';

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

    const [error, setError] = useState<string | null>(null);

    if (!movie) return null;

    const imageUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : 'N/A';

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    const currentStatus = movieEntryData?.data?.status;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => onClose(false)}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl relative animate-in fade-in duration-200"
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

                <div className="flex flex-col md:flex-row">
                    {/* Movie Poster */}
                    <div className="md:w-2/5 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={movie.title}
                                className="w-full h-64 md:h-full object-cover rounded-l-2xl"
                            />
                        ) : (
                            <div className="w-full h-64 md:h-full flex items-center justify-center">
                                <Film className="w-16 h-16 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Movie Details */}
                    <div className="md:w-3/5 p-6 md:p-8 flex flex-col">
                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {movie.title}
                        </h2>

                        {/* Meta Information */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            {/* Rating */}
                            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full">
                                <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-500 fill-yellow-600 dark:fill-yellow-500" />
                                <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                    {rating}
                                </span>
                            </div>

                            {/* Release Year */}
                            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                    {releaseYear}
                                </span>
                            </div>

                            {/* Media Type */}
                            {movie.media_type && (
                                <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
                                    <Film className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-semibold text-purple-800 dark:text-purple-300 capitalize">
                                        {movie.media_type}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Overview */}
                        <div className="flex-1 overflow-y-auto mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Overview
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {movie.overview || 'No overview available for this movie.'}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                    </div>
                </div>
            </div>
        </div>
        </Portal>

    );
};

export default MovieInfoModel;