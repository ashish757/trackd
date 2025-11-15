/**
 * LoadingSpinner Component
 * A simple, reusable loading spinner with customizable size
 */

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
}

export default function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
    const sizeClasses = {
        small: 'w-6 h-6 border-2',
        medium: 'w-12 h-12 border-3',
        large: 'w-16 h-16 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={`${sizeClasses[size]} border-slate-600 border-t-blue-500 rounded-full animate-spin`}
            />
            {message && (
                <p className="text-slate-400 text-lg">{message}</p>
            )}
        </div>
    );
}

