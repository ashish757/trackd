import type { SkeletonLayout } from '../../types/movie.types';

/**
 * MovieCardSkeleton Component
 * Loading skeleton for movie cards with grid and list layouts
 */
interface MovieCardSkeletonProps {
    count?: number;
    layout?: SkeletonLayout;
}

export default function MovieCardSkeleton({ layout = 'grid', count = 10 }: MovieCardSkeletonProps) {
    if (layout === 'grid') {
        return (
            <>
                {Array.from({ length: count }).map((_, index) => (
                    <CardGridSkeleton key={index} />
                ))}
            </>
        );
    }

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <CardListSkeleton key={index} />
            ))}
        </>
    );
}

/**
 * Grid layout skeleton - matches MyListMovieCard grid view
 */
function CardGridSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            {/* Poster placeholder */}
            <div className="aspect-2/3 bg-linear-to-br from-gray-200 to-gray-300"></div>

            {/* Content placeholder */}
            <div className="p-3 space-y-2">
                {/* Title */}
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                {/* Year/Rating */}
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    );
}

/**
 * List layout skeleton - matches MyListMovieCard list view
 * Smaller dimensions to match actual list view design
 */
function CardListSkeleton() {
    return (
        <div className="bg-white p-1 md:p-2 mb-0 animate-pulse">
            <div className="flex gap-2 md:gap-4">
                <div className="w-16 md:w-20 h-20 md:h-26 bg-gray-200 rounded shrink-0"></div>
                {/* Content */}
                <div className="flex-1 space-y-2">
                    {/* Title and metadata in one line */}
                    <div className="h-4 md:h-5 bg-gray-200 rounded w-full"></div>
                    {/* Genres */}
                    <div className="flex gap-1 md:gap-2">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    {/* Controls */}
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
            </div>
        </div>
    );
}


