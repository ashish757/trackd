/**
 * MovieGridSkeleton Component
 * Loading skeleton for movie grid layouts
 */

import MovieCardSkeleton from './MovieCardSkeleton';

interface MovieGridSkeletonProps {
    count?: number;
    gridCols?: string;
    gap?: string;
}

export default function MovieGridSkeleton({
    count = 10,
    gridCols = "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
    gap = "gap-4"
}: MovieGridSkeletonProps) {
    return (
        <div className={`grid ${gridCols} ${gap}`}>
            {Array.from({ length: count }).map((_, index) => (
                <MovieCardSkeleton key={index} />
            ))}
        </div>
    );
}

