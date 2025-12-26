import {Link} from 'react-router-dom';
import {Mail, Loader2} from "lucide-react";
import React, {useState, useRef} from "react";
import {useForgetPasswordMutation} from "../redux/auth/authApi.ts";
import ErrorAlert from "../components/ErrorAlert.tsx";
import SuccessAlert from "../components/SuccessAlert.tsx";
import { useKeyboardHandler } from "../hooks/useKeyboardHandler.ts";

function ForgetPassword() {

    const [email, setEmail] = useState('');
    const [forgetPassword, {isLoading}] = useForgetPasswordMutation();
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // Ref for input field
    const emailRef = useRef<HTMLInputElement>(null);

    // Apply keyboard handler for mobile
    useKeyboardHandler([emailRef]);

    const handelSubmit  = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await forgetPassword({email: email}).unwrap();
            setSuccess('OTP sent successfully! Please check your email.');
            setEmail('');
        } catch (err: unknown) {
            console.error("Failed to send forget password request:", err);
            const error = err as { data?: { message?: string }; message?: string };
            const errorMessage = error?.data?.message || error?.message || 'Failed to send OTP. Please try again.';
            setError(errorMessage);
        }
    }

    return (
        <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-purple-50 md:via-white md:to-indigo-50 md:flex items-center md:justify-center md:px-4 md:py-12 pt-10">
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
                    <h2 className="text-3xl font-bold text-gray-900">Password Reset</h2>
                    <p className="mt-2 text-gray-600">Enter you E-mail to receive a password reset link </p>
                </div>

                {/* Form Card */}
                <div className="bg-white md:rounded-2xl md:shadow-xl md:p-8 space-y-5">

                    {error && <ErrorAlert error={error}/>  }
                    {success && <SuccessAlert success={success} />}

                    <form onSubmit={(e) =>handelSubmit(e)}  className="space-y-5">

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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    aria-label="Email Address"
                                    aria-required="true"
                                    disabled={isLoading}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>


                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Sending Reset Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}


export default ForgetPassword;