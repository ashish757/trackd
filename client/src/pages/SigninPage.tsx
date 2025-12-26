import { useState, useRef } from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import {useLoginMutation} from "../redux/auth/authApi.ts";
import { validateEmail } from "../utils/validation.ts";
import { getSafeRedirect } from "../utils/redirect.ts";
import GoogleLoginButton from "../components/GoogleLoginButton.tsx";
import { useKeyboardHandler } from "../hooks/useKeyboardHandler.ts";

function SigninPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Refs for input fields
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Apply keyboard handler for mobile
    useKeyboardHandler([emailRef, passwordRef]);

    const [login, {isLoading}] = useLoginMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate form fields
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        // Validate email format
        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password length (minimum 6 characters)
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            console.log('Attempting login...');
            const result = await login(formData).unwrap();
            console.log('Login successful:', result);

            // Get safe redirect URL from query params, default to /home
            const redirectTo = getSafeRedirect(searchParams.get('redirect'));
            navigate(redirectTo);
        } catch (err: unknown) {
            console.error('Login error:', err);
            // Handle RTK Query error object
            const error = err as { data?: { message?: string }; message?: string };
            const errorMessage = error?.data?.message || error?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            // IMPORTANT: Don't navigate or reload on error
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-purple-50 md:via-white md:to-indigo-50 flex items-center justify-center md:px-4 md:py-12">
            <div className="max-w-md w-full px-4 md:px-0">
                {/* Header */}
                <div className="text-center mb-6 md:mb-8 pt-8 md:pt-0">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4 md:mb-6">
                        <img
                            alt="Trackd"
                            src="/logo.svg"
                            className="h-8 md:h-10 w-auto"
                        />
                        <span className="text-xl md:text-2xl font-bold text-gray-900">Trackd</span>
                    </Link>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="mt-2 text-sm md:text-base text-gray-600">Sign in to continue tracking</p>
                </div>

                {/* Form Card */}
                <div className="bg-white md:rounded-2xl md:shadow-xl md:p-8 space-y-5">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <div className="shrink-0">
                                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="shrink-0 text-red-600 hover:text-red-800 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    ref={emailRef}
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm md:text-base"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    ref={passwordRef}
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm md:text-base"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-end">
                            <Link
                                to="/forget-password"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <GoogleLoginButton />

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SigninPage;

