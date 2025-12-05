import { useChangeEmailMutation } from "../redux/auth/authApi.ts";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { ApiError } from "../utils/Types.ts";

const ChangeEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. FixedCacheKey handles RTK Query state sharing across remounts
    const [changeEmail, { status: mutationStatus }] = useChangeEmailMutation({
        fixedCacheKey: 'verify-email-process'
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const hasRunRef = useRef(false);
    const token = searchParams.get('token');

    useEffect(() => {
        // 2. Setup "isMounted" flag to prevent updates if component is destroyed
        let isMounted = true;

        let timeoutId: ReturnType<typeof setTimeout>;

        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification token.');
            return;
        }

        // Prevent double-execution (React Strict Mode or fast remounts)
        if (hasRunRef.current) return;

        if (mutationStatus === 'pending' || mutationStatus === 'fulfilled') return;

        hasRunRef.current = true;

        const verifyEmail = async () => {
            setStatus('loading');
            try {
                const response = await changeEmail({ token }).unwrap();

                // 4. STOP if unmounted: Do not update state if user left the page
                if (!isMounted) return;

                setStatus('success');
                setMessage(response?.message || 'Email changed successfully!');

                timeoutId = setTimeout(() => {
                    // Only navigate if still mounted
                    if (isMounted) navigate('/profile');
                }, 3000);

            } catch (err) {
                // STOP if unmounted
                if (!isMounted) return;

                const error = err as ApiError;
                setStatus('error');
                const errorMessage =
                    error?.data?.message ||
                    error?.data?.error ||
                    error?.message ||
                    'Failed to change email. Please try again.';
                setMessage(String(errorMessage));
            }
        };

        verifyEmail();

        // 5. Cleanup function
        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId); // Cancel pending navigation
        };
    }, [token, changeEmail, navigate, mutationStatus]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Verifying Email Change...</h2>
                        <p className="text-gray-600 mt-2">Please wait while we process your request.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Email Changed Successfully!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirecting to your profile...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Verification Failed</h2>
                        <p className="text-red-600 mt-2">{message}</p>
                        <button
                            onClick={() => navigate('/profile')}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Profile
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChangeEmail;