import { useState, useEffect } from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import { Mail, Lock, User, X, Loader, Eye, EyeOff, Clock } from 'lucide-react';
import { useRequestOtpMutation, useVerifyOtpMutation, useRegisterMutation } from "../redux/auth/authApi.ts";
import { validateEmail, validatePassword, validateName } from "../utils/validation.ts";
import { storage } from "../utils/config.ts";
import { getSafeRedirect } from "../utils/redirect.ts";
import GoogleLoginButton from "../components/GoogleLoginButton.tsx";

function SignupPage() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({ name: '', email: '', password: '', });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpSent, setOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [ reqOtp, {isLoading}] = useRequestOtpMutation();
    const [verifyOtp, {isLoading: isVerifying}] = useVerifyOtpMutation();
    const [register] = useRegisterMutation();

    // Timer countdown effect
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (resendTimer === 0 && otpSent) {
            setCanResend(true);
        }
    }, [resendTimer, otpSent]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Update password strength in real-time
        if (name === 'password') {
            const validation = validatePassword(value);
            setPasswordStrength(validation.strength);
        }

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit
        if (value && !/^\d$/.test(value)) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Only process if it's a 6-digit number
        if (!/^\d{6}$/.test(pastedData)) {
            return;
        }

        // Split the pasted data into individual digits
        const digits = pastedData.split('');
        const newOtp = [...otp];

        // Fill all boxes with the pasted digits
        digits.forEach((digit, index) => {
            if (index < 6) {
                newOtp[index] = digit;
            }
        });

        setOtp(newOtp);

        // Focus on the last input box
        const lastInput = document.getElementById('otp-5');
        lastInput?.focus();

        // Clear error when user pastes
        if (error) setError('');
    };

    const handleEditDetails = () => {
        setOtpSent(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
        setResendTimer(0);
        setCanResend(false);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate name
        if (!formData.name || !validateName(formData.name)) {
            setError('Please enter a valid name (at least 2 characters)');
            return;
        }

        // Validate email
        if (!formData.email || !validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password (only 6 characters minimum)
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.errors[0]);
            return;
        }

        try {
            const res = await reqOtp(
                { email: formData.email, name: formData.name },
            ).unwrap();

            if(res.statusCode === 200) {
                setOtpSent(true);
                storage.setItem("otpToken", res.data.otpToken);
                setResendTimer(30); // Start 30-second countdown
                setCanResend(false);
            } else {
                setError('Failed to send OTP. Please try again.');
            }
        } catch {
            setError('Error occurred while sending OTP');
        }
    };

    const handleVerifyOtp = async () => {
        setError('');

        const otpString = otp.join('');
        if (!otpString || otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        try {
            const token = storage.getItem("otpToken");
            if(!token) {
                setError('No OTP token found. Please resend OTP.');
                return;
            }

            // Step 1: Verify OTP
            const verifyRes = await verifyOtp({otpToken: token, otp: otpString, user: formData}).unwrap();
            console.log('OTP Verification Response:', verifyRes);

            if(verifyRes.statusCode !== 200) {
                setError(verifyRes.message || 'Invalid OTP. Please try again.');
                return;
            }

            // Step 2: Register the user after successful OTP verification
            setIsCreatingAccount(true);
            const registerRes = await register({otpToken: token, otp: otpString, user: formData}).unwrap();
            console.log('Registration Response:', registerRes);

            if(registerRes.status === 'success' || registerRes.statusCode === 201) {
                // Clear OTP token from storage
                storage.removeItem("otpToken");

                // Get safe redirect URL from query params, default to /home
                const redirectTo = getSafeRedirect(searchParams.get('redirect'));
                navigate(redirectTo);
            } else {
                setError(registerRes.message || 'Registration failed. Please try again.');
            }
        } catch (e: unknown) {
            console.error('Error during verification/registration:', e);
            const errorMessage = (e as { data?: { message?: string } })?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
        } finally {
            setIsCreatingAccount(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        try {
            const res = await reqOtp(formData).unwrap();
            if(res.statusCode === 200) {
                storage.setItem("otpToken", res.data.otpToken);
                setOtp(['', '', '', '', '', '']);
                setResendTimer(30); // Restart 30-second countdown
                setCanResend(false);
            } else {
                setError('Failed to resend OTP. Please try again.');
            }
        } catch {
            setError('Error occurred while resending OTP');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12 pb-24 md:pb-12">
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
                    <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-gray-600">Start tracking your favorite shows and movies</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                            <button
                                onClick={() => setError('')}
                                className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={otpSent ? (e) => { e.preventDefault(); handleVerifyOtp(); } : handleSendOtp} className="space-y-5">
                        {!otpSent ? (
                            <>
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            disabled={isLoading}
                                            autoComplete="name"
                                            aria-label="Full Name"
                                            aria-required="true"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

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
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            disabled={isLoading}
                                            autoComplete="email"
                                            aria-label="Email Address"
                                            aria-required="true"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="you@example.com"
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
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            disabled={isLoading}
                                            autoComplete="new-password"
                                            aria-label="Password"
                                            aria-required="true"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            placeholder="Create a strong password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {formData.password && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${
                                                            passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                                                            passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                                                            'w-full bg-green-500'
                                                        }`}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium ${
                                                    passwordStrength === 'weak' ? 'text-red-600' :
                                                    passwordStrength === 'medium' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <p className="mt-1 text-sm text-gray-500">
                                        Must be at least 6 characters long
                                    </p>
                                </div>

                                {/* Send OTP Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="h-5 w-5 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* OTP Verification View */}
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Verify Your Email
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        We've sent a verification code to
                                    </p>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className="font-semibold text-gray-900">{formData.email}</span>
                                        <button
                                            type="button"
                                            onClick={handleEditDetails}
                                            disabled={isVerifying || isCreatingAccount}
                                            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                {/* OTP Input Boxes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                        Enter Verification Code
                                    </label>
                                    <div className="flex justify-center gap-3 mb-6">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                onPaste={handleOtpPaste}
                                                disabled={isVerifying || isCreatingAccount}
                                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                aria-label={`Digit ${index + 1}`}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Resend OTP */}
                                <div className="text-center mb-4">
                                    {!canResend && resendTimer > 0 ? (
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                Resend code in <span className="font-semibold">{resendTimer}s</span>
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading || !canResend || isVerifying || isCreatingAccount}
                                            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Didn't receive the code? Resend
                                        </button>
                                    )}
                                </div>

                                {/* Verify Button */}
                                <button
                                    type="submit"
                                    disabled={isVerifying || isCreatingAccount || otp.some(digit => !digit)}
                                    className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isVerifying || isCreatingAccount ? (
                                        <>
                                            <Loader className="h-5 w-5 animate-spin" />
                                            {isCreatingAccount ? 'Creating Account...' : 'Verifying...'}
                                        </>
                                    ) : (
                                        'Verify & Create Account'
                                    )}
                                </button>
                            </>
                        )}
                    </form>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/signin" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {/* Divider */}
                    {!otpSent && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            {/* Google Login Button */}
                            <div className="mt-6">
                                <GoogleLoginButton />
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}

export default SignupPage;