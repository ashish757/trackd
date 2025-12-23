/**
 * UserCardSkeleton Component
 * Loading skeleton for user cards (in find users page)
 */

interface UserCardSkeletonProps {
    count?: number;
}

export default function UserCardSkeleton({ count = 6 }: UserCardSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mb-4"></div>

                        {/* Name */}
                        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>

                        {/* Username */}
                        <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>

                        {/* Mutual friends */}
                        <div className="h-3 bg-gray-200 rounded w-28 mb-4"></div>

                        {/* Button */}
                        <div className="h-9 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            ))}
        </>
    );
}

