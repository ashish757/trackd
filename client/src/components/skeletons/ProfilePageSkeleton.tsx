import Navbar from '../Navbar';
import { ProfileHeaderSkeleton } from './';

/**
 * Full page skeleton for ProfilePage
 * Shows while auth is being verified
 */
export default function ProfilePageSkeleton() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20 md:pb-8">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <ProfileHeaderSkeleton />

                    {/* Profile Details Skeleton */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

