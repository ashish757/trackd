import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    maxRating?: number;
    size?: number;
    readonly?: boolean;
    showValue?: boolean;
}

const StarRating = ({
    rating,
    onRatingChange,
    maxRating = 10,
    size = 24,
    readonly = false,
    showValue = true
}: StarRatingProps) => {
    const [hoverRating, setHoverRating] = useState<number>(0);

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    // Calculate stars (out of 10 stars for visual, matching the 1-10 rating scale)
    const starCount = 10;
    const filledStars = Math.round((displayRating / maxRating) * starCount);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: starCount }, (_, index) => {
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
                })}
            </div>
            {showValue && displayRating > 0 && (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[2rem]">
                    {displayRating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;

