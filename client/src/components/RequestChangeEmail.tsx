import React, { useEffect, useState } from 'react';
import { useRequestChangeEmailMutation } from "../redux/auth/authApi.ts";
import type { ApiError } from "../utils/Types.ts";

const RequestChangeEmail = (props: { oldEmail: string | undefined }) => {
    const [email, setEmail] = useState('');
    const [requestChangeEmail, { isLoading }] = useRequestChangeEmailMutation();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const validateEmail = (value: string) => {
        if (!value) return 'Email is required.';
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        const trimmedEmail = email.trim();
        const validationError = validateEmail(trimmedEmail);

        if (validationError) {
            setErrorMsg(validationError);
            return;
        }

        try {
            await requestChangeEmail({newEmail: trimmedEmail}).unwrap();
            setSuccessMsg('Verification email sent successfully. Please check your inbox.');
        } catch (e) {
            const err = e as ApiError;

            const message =
                err?.data?.message ||
                err?.data?.error ||
                err?.message ||
                'Failed to request email change. Please try again.';
            setErrorMsg(String(message));
        }
    };

    useEffect(() => {
        if (props.oldEmail) {
            setEmail(props.oldEmail);
        }
    }, [props.oldEmail]);

    return (
        <div>
            <form className="space-y-4 max-w-md" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                        New Email Address
                    </label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                        disabled={isLoading}
                    />
                </div>

                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isLoading ? 'Processing...' : 'Update E-mail'}
                </button>
            </form>
        </div>
    );
};

export default RequestChangeEmail;
