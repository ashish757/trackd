/**
 * FriendListItemSkeleton Component
 * Loading skeleton for friend list items
 */

interface FriendListItemSkeletonProps {
    count?: number;
}

export default function FriendListItemSkeleton({ count = 3 }: FriendListItemSkeletonProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 animate-pulse">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0"></div>

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>

                    {/* Action button */}
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    );
}

