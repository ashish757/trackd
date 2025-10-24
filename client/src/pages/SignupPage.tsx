import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { Mail, Lock, User, X, Loader } from 'lucide-react';

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [otp, setOtp] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const base = "http://localhost:3000";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form fields
        if (!formData.name || !formData.email || !formData.password) {
            alert('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            const res: Response = await fetch(base + '/auth/send-otp', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            }) ;
            const data: {statusCode: number, otpToken: string} = await res.json();
            console.log(data);
            if(data.statusCode === 200) {
                setIsLoading(false);
                setShowOtpModal(true);

                localStorage.setItem("otpToken", data.otpToken)


            } else {
                setIsLoading(false);
                alert('Failed to send OTP. Please try again.');
            }
        } catch (e) {
            console.log(e);
            setIsLoading(false);
            alert('Error occurred');
        }


    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            alert('Please enter the OTP');
            return;
        }

        // setIsVerifying(true);
        try {
            const token  = localStorage.getItem("otpToken");
            if(token) {

            const res = await fetch(base + '/auth/verify-otp', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    otpToken: token,
                    otp: parseInt(otp),
                    user: formData
                })
            });

            const data: {status: boolean, message?: string} = await res.json();
            if(data.status) {
                setIsVerifying(false);
                alert('Account created successfully!');
                navigate('/')
            }
            } else {
                setIsVerifying(false);
                alert('No OTP token found. Please resend OTP.');
            }


        } catch (e) {
            alert(e);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        // Simulate API call to resend OTP
        setTimeout(() => {
            setIsLoading(false);
            alert('OTP resent to your email!');
        }, 1000);
    };

    const handleCloseModal = () => {
        setShowOtpModal(false);
        setOtp('');
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
                    <form onSubmit={handleSendOtp} className="space-y-5">
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
                            <div className="relative">
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
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-slide-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Verify Email</h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                We've sent a verification code to <span className="font-semibold">{formData.email}</span>
                            </p>

                            {/* OTP Input */}
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-semibold focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="000000"
                                    autoFocus
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerifyOtp}
                                disabled={isVerifying || otp.length !== 6}
                                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Create Account'
                                )}
                            </button>

                            {/* Resend OTP */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                                >
                                    Didn't receive the code? Resend
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignupPage;