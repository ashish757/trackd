import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Text */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-blue-600 mb-2">404</h1>
                    <div className="h-1 w-20 bg-blue-600 mx-auto rounded"></div>
                </div>

                {/* Message */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home className="h-5 w-5" />
                        Go to Home
                    </button>
                </div>

                {/* Illustration */}
                <div className="mt-12">
                    <svg
                        className="mx-auto h-48 w-48 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;

