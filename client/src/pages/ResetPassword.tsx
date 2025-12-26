import {Link, useNavigate, useSearchParams} from "react-router-dom";
import { Lock, Loader2} from "lucide-react";
import {useState, useRef, type FormEvent} from "react";
import {useResetPasswordMutation} from "../redux/auth/authApi.ts";
import SuccessAlert from "../components/SuccessAlert.tsx";
import ErrorAlert from "../components/ErrorAlert.tsx";
import { useKeyboardHandler } from "../hooks/useKeyboardHandler.ts";

const ResetPassword = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [cnfPassword, setCnfPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Refs for input fields
    const passwordRef = useRef<HTMLInputElement>(null);
    const cnfPasswordRef = useRef<HTMLInputElement>(null);

    // Apply keyboard handler for mobile
    useKeyboardHandler([passwordRef, cnfPasswordRef]);

    const [resetPassword, {isLoading}] = useResetPasswordMutation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== cnfPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await resetPassword({
                token,
                newPassword: password
            }).unwrap();

            setSuccess('Password reset successfully! Redirecting to sign in...');
            setPassword('');
            setCnfPassword('');

            // Redirect to signin after 1 seconds
            setTimeout(() => {
                navigate('/signin');
            }, 1000);

        } catch (err: unknown) {
            console.error("Failed to reset password:", err);
            const error = err as { data?: { message?: string }; message?: string };
            const errorMessage = error?.data?.message || error?.message || 'Failed to reset password. Please try again.';
            setError(errorMessage);
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <img
                            alt="Trackd"
                            src="/logo.svg"
                            className="h-10 w-auto"
                        />
                        <span className="text-2xl font-bold text-gray-900">Trackd</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-gray-600">Enter your new password</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {error && <ErrorAlert error={error} />}
                    {success && <SuccessAlert success={success} />}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    ref={passwordRef}
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    aria-label="New Password"
                                    aria-required="true"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Enter new password (min. 6 characters)"
                                />
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="cnf-password" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    ref={cnfPasswordRef}
                                    id="cnf-password"
                                    name="cnf-password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    aria-label="Confirm Password"
                                    aria-required="true"
                                    value={cnfPassword}
                                    onChange={(e) => setCnfPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/signin" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>

    );
};

export default ResetPassword;