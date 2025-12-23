/**
 * SearchSuggestionSkeleton Component
 * Loading skeleton for search suggestions
 */

interface SearchSuggestionSkeletonProps {
    count?: number;
}

export default function SearchSuggestionSkeleton({ count = 5 }: SearchSuggestionSkeletonProps) {
    return (
        <div className="py-2">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    {/* Poster */}
                    <div className="w-12 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded animate-pulse flex-shrink-0"></div>

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

