import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle, Loader } from 'lucide-react';

function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        otp: '',
        password: '',
    });

    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            alert('Please enter your email address');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setOtpSent(true);
            setShowOtpInput(true);
            setIsLoading(false);
            alert('OTP sent to your email!');
        }, 1000);
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp) {
            alert('Please enter the OTP');
            return;
        }

        setIsVerifying(true);
        // Simulate API call
        setTimeout(() => {
            setOtpVerified(true);
            setIsVerifying(false);
            alert('OTP verified successfully!');
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!otpVerified) {
            alert('Please verify your email with OTP first');
            return;
        }

        console.log('Signup data:', formData);
        // Handle signup logic here
    };

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
                    <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-gray-600">Start tracking your favorite shows and movies</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={otpVerified}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="you@example.com"
                                    />
                                    {otpVerified && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {!otpVerified && (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isLoading || !formData.email}
                                        className="px-4 py-2.5 text-sm text-white bg-violet-400 rounded-md font-sm disabled:opacity-80 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isLoading ? (
                                            <Loader className="h-5 w-5 animate-spin" />
                                        ) : otpSent ? (
                                            'Resend'
                                        ) : (
                                            'send OTP'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* OTP Field (Shows after Send OTP is clicked) */}
                        {showOtpInput && !otpVerified && (
                            <div className="animate-fade-in">
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        value={formData.otp}
                                        onChange={handleChange}
                                        maxLength={6}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg tracking-widest focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        placeholder="Enter 6-digit OTP"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifying || !formData.otp}
                                        className="px-4 py-2.5 bg-green-600 text-white rounded-md text-sm disabled:opacity-80 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isVerifying ? (
                                            <Loader className="h-5 w-5 animate-spin" />
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Check your email for the verification code
                                </p>
                            </div>
                        )}

                        {/* Password Field (Shows after OTP is verified) */}
                        {otpVerified && (
                            <div className="animate-fade-in">
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
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        placeholder="Create a strong password"
                                    />
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Must be at least 8 characters long
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!otpVerified || !formData.password}
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:cursor-not-allowed mt-6"
                        >
                            Sign Up
                        </button>
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
                </div>

                {/*/!* Terms *!/*/}
                {/*<p className="mt-6 text-center text-xs text-gray-500">*/}
                {/*    By signing up, you agree to our{' '}*/}
                {/*    <a href="#" className="underline hover:text-gray-700">Terms of Service</a>*/}
                {/*    {' '}and{' '}*/}
                {/*    <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>*/}
                {/*</p>*/}
            </div>
        </div>
    );
}

export default SignupPage;