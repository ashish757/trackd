/**
 * StatCardSkeleton Component
 * Loading skeleton for stat cards
 */

export default function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {/* Value */}
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    {/* Label */}
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                {/* Icon */}
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
}

