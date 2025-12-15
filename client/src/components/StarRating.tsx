import { Star } from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    maxRating?: number;
    size?: number;
    readonly?: boolean;
    showValue?: boolean;
}

const StarRating = memo(({
    rating,
    onRatingChange,
    maxRating = 10,
    size = 24,
    readonly = false,
    showValue = true
}: StarRatingProps) => {
    const [hoverRating, setHoverRating] = useState<number>(0);

    const handleClick = useCallback((value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    }, [readonly, onRatingChange]);

    const handleMouseEnter = useCallback((value: number) => {
        if (!readonly) {
            setHoverRating(value);
        }
    }, [readonly]);

    const handleMouseLeave = useCallback(() => {
        if (!readonly) {
            setHoverRating(0);
        }
    }, [readonly]);

    const displayRating = hoverRating || rating;

    // Calculate stars (out of 10 stars for visual, matching the 1-10 rating scale)
    const starCount = 10;
    const filledStars = Math.round((displayRating / maxRating) * starCount);

    // Memoize star array to prevent recreation on every render
    const stars = useMemo(() => {
        return Array.from({ length: starCount }, (_, index) => {
            const starValue = ((index + 1) / starCount) * maxRating;
            const isFilled = index < filledStars;

            return (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleClick(starValue)}
                    onMouseEnter={() => handleMouseEnter(starValue)}
                    onMouseLeave={handleMouseLeave}
                    disabled={readonly}
                    className={`transition-all duration-150 ${
                        readonly ? 'cursor-default' : 'cursor-pointer '
                    } focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded`}
                    aria-label={`Rate ${starValue} out of ${maxRating}`}
                >
                    <Star
                        size={size}
                        className={`transition-colors duration-150 ${
                            isFilled
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300 dark:text-gray-600'
                        } ${!readonly && 'hover:text-yellow-400 hover:fill-yellow-400'}`}
                    />
                </button>
            );
        });
    }, [starCount, maxRating, filledStars, handleClick, handleMouseEnter, handleMouseLeave, readonly, size]);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {stars}
            </div>
            {showValue && displayRating > 0 && (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-8">
                    {displayRating.toFixed(1)}
                </span>
            )}
        </div>
    );
});

StarRating.displayName = 'StarRating';

export default StarRating;

