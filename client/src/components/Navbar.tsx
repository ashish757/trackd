import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogoutMutation } from '../redux/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../redux/auth/authSlice';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { RootState } from '../redux/store';
import type { User } from '../redux/user/userApi';
import Notifications from "./Notifications.tsx";
import NavbarSkeleton from "./NavbarSkeleton.tsx";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [logout, { isLoading }] = useLogoutMutation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user = useSelector((state: RootState) => state.auth.user) as User | null;
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            // Call server logout endpoint (clears HttpOnly cookie)
            await logout({}).unwrap();

            // Dispatch Redux action to clear state
            dispatch(logoutAction());

            // Redirect to signin
            navigate('/signin');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if server call fails, clear local state
            dispatch(logoutAction());
            navigate('/signin');
        }
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className={`bg-white shadow-xm border-b border-gray-200 hidden md:block`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className={`flex items-center gap-8 ${isAuthenticated ? 'hidden md:flex' : 'flex'} flex-1`}>
                        <Link to="/" className="flex items-center gap-2">
                            <img alt="Trackd" src="/logo.svg" className="h-8 w-auto" />
                            <span className="text-xl font-bold text-gray-900">Trackd</span>
                        </Link>

                        {/* Nav Links - Desktop Only */}
                        <div className="flex items-center gap-6">
                            <Link
                                to="/home"
                                className={`text-sm font-medium transition-colors ${
                                    isActive('/home')
                                        ? 'text-blue-600'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/discover"
                                className={`text-sm font-medium transition-colors ${
                                    isActive('/discover')
                                        ? 'text-blue-600'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                Discover
                            </Link>

                            <Link
                                to="/find"
                                className={`text-sm font-medium transition-colors ${
                                    isActive('/find')
                                        ? 'text-blue-600'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                Find
                            </Link>

                            {isAuthenticated && (
                                    <Link
                                        to="/my-list"
                                        className={`text-sm font-medium transition-colors ${
                                            isActive('/my-list')
                                                ? 'text-blue-600'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        My List
                                    </Link>
                            )}

                        </div>
                    </div>

                    {/* Right side - Desktop Only */}
                    {!isInitialized ? (
                        /* Show skeleton while checking auth status */
                        <NavbarSkeleton />
                    ) : isAuthenticated ? (
                        <div className="hidden md:flex items-center gap-4">
                            {/* Notifications - Desktop Only */}
                            <Notifications />

                            {/* User Dropdown - Desktop Only */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    {
                                        user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="User Avatar"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )
                                    }
                                    <span>{user?.name || user?.email || 'User'}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                navigate('/profile');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <UserIcon className="h-4 w-4"/>
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                navigate('/settings');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <Settings className="h-4 w-4"/>
                                            Settings
                                        </button>
                                        <hr className="my-1 border-gray-200"/>
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoading}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <LogOut className="h-4 w-4"/>
                                            {isLoading ? 'Logging out...' : 'Logout'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Unauthenticated - Show Sign In / Sign Up */
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/signin?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to={`/signup?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;