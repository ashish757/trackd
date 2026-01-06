import Navbar from '../Navbar';
import { StatCardSkeleton, MovieCardSkeleton } from './';

/**
 * Full page skeleton for MyListPage
 * Shows while auth is being verified
 */
export default function MyListPageSkeleton() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Title Skeleton */}
                        <div className="h-10 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>

                        {/* Stats Cards Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>

                        {/* Tabs Skeleton */}
                        <div className="flex gap-2 mb-6 animate-pulse">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded px-6 w-24"></div>
                            ))}
                        </div>

                        {/* Movie Grid Skeleton */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <MovieCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

