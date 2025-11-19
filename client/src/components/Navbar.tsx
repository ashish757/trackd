import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogoutMutation } from '../redux/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../redux/auth/authSlice';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { RootState } from '../redux/store';
import Notifications from "./Notifications.tsx";

interface UserType {
    name?: string;
    email?: string;
}

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [showNotifications, setShowNotifications] = useState(false);
    const [logout, { isLoading }] = useLogoutMutation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user = useSelector((state: RootState) => state.auth.user) as UserType;

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
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <img alt="Trackd" src="/logo.svg" className="h-8 w-auto" />
                            <span className="text-xl font-bold text-gray-900">Trackd</span>
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-6">
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
                                to="/my-list"
                                className={`text-sm font-medium transition-colors ${
                                    isActive('/my-list')
                                        ? 'text-blue-600'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                My List
                            </Link>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center gap-4">

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors" >
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-gray-700"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor" >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </button>

                            {showNotifications ? <Notifications /> : <div></div>}

                        </div>

                </div>

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="hidden md:inline">{user?.name || user?.email || 'User'}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate('/profile');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate('/settings');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {isLoading ? 'Logging out...' : 'Logout'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;