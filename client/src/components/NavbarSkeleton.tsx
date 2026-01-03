/**
 * Navbar Skeleton Component
 * Shows loading state in navbar while checking authentication status
 */
const NavbarSkeleton = () => {
    return (
        <div className="flex items-center gap-4">
            {/* Notification Icon Skeleton */}
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>

            {/* User Dropdown Skeleton */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
        </div>
    );
};

export default NavbarSkeleton;

