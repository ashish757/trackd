/**
 * ProfileHeaderSkeleton Component
 * Loading skeleton for user profile header
 */

export default function ProfileHeaderSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 animate-pulse">
            <div className="flex items-start gap-8 mb-6">
                {/* Profile Picture Skeleton */}
                <div className="flex-shrink-0">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                </div>

                {/* Profile Info Skeleton */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-4">
                        {/* Username */}
                        <div className="h-7 bg-gray-200 rounded w-32"></div>
                        {/* Edit button */}
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        {/* Settings icon */}
                        <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-10 mb-4">
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>

                    {/* Name and Bio */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

