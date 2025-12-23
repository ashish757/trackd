/**
 * MovieCardSkeleton Component
 * Loading skeleton for movie cards
 */

export default function MovieCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            {/* Poster placeholder */}
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300"></div>

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

