import { Link, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../redux/auth/authApi';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../redux/auth/authSlice';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logout, { isLoading }] = useLogoutMutation();

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

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <img alt="Trackd" src="/logo.svg" className="h-8 w-auto" />
                        <span className="text-xl font-bold text-gray-900">Trackd</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <LogOut className="h-4 w-4" />
                            {isLoading ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;