/**
 * MovieGridSkeleton Component
 * Loading skeleton for movie grid layouts
 */

import MovieCardSkeleton from './MovieCardSkeleton';

interface MovieGridSkeletonProps {
    count?: number;
}

export default function MovieGridSkeleton({ count = 10 }: MovieGridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <MovieCardSkeleton key={index} />
            ))}
        </div>
    );
}

