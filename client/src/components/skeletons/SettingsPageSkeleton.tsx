import Navbar from '../Navbar';

/**
 * Full page skeleton for SettingsPage
 * Shows while auth is being verified
 */
export default function SettingsPageSkeleton() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pb-20 md:pb-8 bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Title Skeleton */}
                        <div className="h-10 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>

                        <div className="space-y-6">
                            {/* Settings Card Skeleton */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

