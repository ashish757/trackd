import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Film, User, LogIn, UserPlus, UserSearch } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

/**
 * Bottom Navigation Bar for Mobile
 * Shows on mobile devices (< md breakpoint)
 * Different items for authenticated vs unauthenticated users
 */
const BottomNav = () => {
    const location = useLocation();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const isActive = (path: string) => location.pathname === path;

    // Navigation items for authenticated users
    const authenticatedNavItems = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/discover', icon: Search, label: 'Discover' },
        { path: '/find', icon: UserSearch, label: 'Find' },
        { path: '/my-list', icon: Film, label: 'My List' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    // Navigation items for unauthenticated users
    const unauthenticatedNavItems = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/discover', icon: Search, label: 'Discover' },
        { path: '/find', icon: UserSearch, label: 'Find' },
        { path: '/signin', icon: LogIn, label: 'Sign In' },
        { path: '/signup', icon: UserPlus, label: 'Sign Up' },
    ];

    const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                                active ? 'text-blue-600' : 'text-gray-600'
                            }`}
                        >
                            <Icon
                                className={`h-6 w-6 transition-all ${
                                    active ? 'scale-110' : 'scale-100'
                                }`}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <span
                                className={`text-xs mt-1 transition-all ${
                                    active ? 'font-semibold opacity-100' : 'opacity-70'
                                }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;

