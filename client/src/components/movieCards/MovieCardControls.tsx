import { Eye, Clock, Heart, Send } from 'lucide-react';
import { useMarkMovieMutation, useUnmarkMovieMutation, useToggleFavoriteMutation, MovieStatus } from '../../redux/userMovie/userMovieApi.ts';
import {useDispatch, useSelector} from 'react-redux';
import type { RootState } from '../../redux/store.ts';
import {showShareModal} from "../../redux/modal/modalSlice.ts";

interface MovieCardControlsProps {
    movieId: number; // Changed from string to number for consistency
    currentStatus?: MovieStatus | null;
    isFavorite?: boolean;
    onSuccess?: () => void;
}

export default function MovieCardControls({
    movieId,
    currentStatus,
    isFavorite = false,
    onSuccess,
}: MovieCardControlsProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const dispatch = useDispatch();

    const [markMovie, { isLoading: isMarking }] = useMarkMovieMutation();
    const [unmarkMovie, { isLoading: isUnmarking }] = useUnmarkMovieMutation();
    const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();

    if (!isAuthenticated) {
        return null;
    }

    const handleMarkMovie = async (status: MovieStatus) => {
        try {
            await markMovie({ movieId, status }).unwrap();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to mark movie:', error);
        }
    };

    const handleUnmarkMovie = async (status: string) => {
        try {
            await unmarkMovie({movieId, status}).unwrap();
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

    const handleShare = () => {
        dispatch(showShareModal(movieId));
    }
    const isLoading = isMarking || isUnmarking || isTogglingFavorite;

    return (
        <div className="relative">
            {/* Quick Action Buttons - Mobile Friendly */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Watched Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (currentStatus === MovieStatus.WATCHED) {
                            handleUnmarkMovie(MovieStatus.WATCHED);
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
                            handleUnmarkMovie(MovieStatus.PLANNED);
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

                {/* Recommend To */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                    }}
                    className="p-1 md:p-1.5 rounded-full  text-gray-800 hover:bg-gray-200 transition-colors"
                    title="Recommend To Friends"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

        </div>
    );
}

