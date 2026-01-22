import {Users, Clapperboard, DollarSign, Globe, X} from 'lucide-react';
import Portal from "../Portal.tsx";

const MovieInfoModelSkeleton = () => {
    return (
        <Portal layer={"modal"}>
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center md:items-start justify-center z-50 md:p-4 overflow-y-auto"
            >
                <div
                    className="bg-white dark:bg-gray-800 md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-4xl animate-in fade-in duration-200 relative overflow-y-auto"
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>

        <div className="animate-pulse bg-white dark:bg-gray-800 w-full overflow-hidden">
            {/* Backdrop Skeleton */}
            <div className="relative w-full h-48 md:h-64 bg-gray-200 dark:bg-gray-700" />

            <div className="flex flex-col md:flex-row p-4 md:p-6 lg:p-8 gap-4 md:gap-6 relative -translate-y-16 md:-translate-y-24">
                {/* Poster Skeleton */}
                <div className="md:w-1/3 shrink-0 relative -translate-y-12 md:-translate-y-16">
                    <div className="aspect-[2/3] w-full bg-gray-300 dark:bg-gray-600 rounded-xl shadow-2xl flex items-center justify-center">
                        <Clapperboard className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="md:w-2/3 flex flex-col pt-4 md:pt-16 lg:pt-20">
                    {/* Title and Tagline */}
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-6" />

                    {/* Meta Badges */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>

                    {/* Overview Section */}
                    <div className="space-y-3 mb-8">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full" />
                        <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-2/3" />
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex gap-3 py-6 border-y border-gray-100 dark:border-gray-700 mb-8">
                        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>

                    {/* Cast Grid Skeleton */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600" />
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24" />
                                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget/Language Skeleton */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-gray-400" />
                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-12" />
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-gray-400" />
                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-12" />
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-8" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
                </div>
            </div>
            </Portal>
    );
};

export default MovieInfoModelSkeleton;