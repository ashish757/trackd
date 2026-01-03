import { useState } from 'react';
import { Eye, Clock, Heart, MoreVertical } from 'lucide-react';
import { useMarkMovieMutation, useRemoveMovieMutation, useToggleFavoriteMutation, MovieStatus } from '../redux/userMovie/userMovieApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface MovieCardControlsProps {
    movieId: number;
    currentStatus?: MovieStatus | null;
    isFavorite?: boolean;
    onSuccess?: () => void;
}

export default function MovieCardControls({
    movieId,
    currentStatus,
    isFavorite = false,
    onSuccess
}: MovieCardControlsProps) {
    const [showMenu, setShowMenu] = useState(false);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [markMovie, { isLoading: isMarking }] = useMarkMovieMutation();
    const [removeMovie, { isLoading: isRemoving }] = useRemoveMovieMutation();
    const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();

    if (!isAuthenticated) {
        return null;
    }

    const handleMarkMovie = async (status: MovieStatus) => {
        try {
            await markMovie({ movieId, status }).unwrap();
            setShowMenu(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to mark movie:', error);
        }
    };

    const handleRemoveMovie = async () => {
        try {
            await removeMovie(movieId).unwrap();
            setShowMenu(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to remove movie:', error);
        }
    };

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite(movieId).unwrap();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const isLoading = isMarking || isRemoving || isTogglingFavorite;

    return (
        <div className="relative">
            {/* Quick Action Buttons - Mobile Friendly */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Watched Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (currentStatus === MovieStatus.WATCHED) {
                            handleRemoveMovie();
                        } else {
                            handleMarkMovie(MovieStatus.WATCHED);
                        }
                    }}
                    disabled={isLoading}
                    className={`p-1 md:p-1.5 rounded-full transition-colors ${
                        currentStatus === MovieStatus.WATCHED
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } disabled:opacity-50`}
                    title="Mark as Watched"
                >
                    <Eye className="w-4 h-4" />
                </button>

                {/* Plan to Watch Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (currentStatus === MovieStatus.PLANNED) {
                            handleRemoveMovie();
                        } else {
                            handleMarkMovie(MovieStatus.PLANNED);
                        }
                    }}
                    disabled={isLoading}
                    className={`p-1 md:p-1.5 rounded-full transition-colors ${
                        currentStatus === MovieStatus.PLANNED
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } disabled:opacity-50`}
                    title="Plan to Watch"
                >
                 <Clock className={`w-4 h-4`} />

                </button>

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite();
                    }}
                    disabled={isLoading}
                    className={`p-1 md:p-1.5 rounded-full transition-colors ${
                        isFavorite
                            ? 'bg-pink-100 text-pink-600'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } disabled:opacity-50`}
                    title="Add to Favorites"
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                {/* More Options */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1 md:p-1.5 rounded-full  text-gray-800 hover:bg-gray-200 transition-colors"
                    title="More Options"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                        }}
                    />

                    {/* Menu */}
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkMovie(MovieStatus.PLANNED);
                            }}
                            disabled={isLoading}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <Clock className="w-4 h-4" />
                            coming soon...
                        </button>

                        {currentStatus && (
                            <>
                                <hr className="my-1 text-gray-300" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveMovie();
                                    }}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 transition-colors"
                                >
                                    Remove from List
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

