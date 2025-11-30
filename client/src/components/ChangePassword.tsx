import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useChangePasswordMutation } from "../redux/user/userApi.ts";

const ChangePassword = () => {

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const handleChange = (field: 'old' | 'new' | 'confirm', value: string) => {
        if (field === 'old') setOldPassword(value);
        if (field === 'new') setNewPassword(value);
        if (field === 'confirm') setConfirmPassword(value);

        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (oldPassword.length < 6) {
            setError('Current password must be at least 6 characters');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        if (oldPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        try {
            await changePassword({
                currentPassword: oldPassword,
                newPassword
            }).unwrap();

            setSuccess('Password changed successfully!');

            // Clear form
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            console.error('Change password error:', err);
            // Handle RTK Query error object
            const error = err as { data?: { message?: string }; message?: string };
            const errorMessage = error?.data?.message || error?.message || 'Failed to change password. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>

            <form className="space-y-4 max-w-md" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError('')}
                            className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Success Alert */}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">{success}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSuccess('')}
                            className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Current Password */}
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="currentPassword">
                        Current Password
                    </label>
                    <input
                        onChange={(e) => handleChange('old', e.target.value)}
                        value={oldPassword}
                        type="password"
                        id="currentPassword"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="newPassword">
                        New Password
                    </label>
                    <input
                        value={newPassword}
                        onChange={(e) => handleChange('new', e.target.value)}
                        type="password"
                        id="newPassword"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                {/* Confirm New Password */}
                <div>
                    <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <input
                        value={confirmPassword}
                        onChange={(e) => handleChange('confirm', e.target.value)}
                        type="password"
                        id="confirmPassword"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Submit Button */}
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
                    {isLoading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;