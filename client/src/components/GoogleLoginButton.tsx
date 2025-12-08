import { API_CONFIG } from "../config/api.config";

const GoogleLoginButton = () => {
    const handleLogin = () => {
        // Direct link to your NestJS backend Google OAuth endpoint
        window.location.href = `${API_CONFIG.BASE_URL}/auth/google`;
    };

    return (
        <button
            onClick={handleLogin}
            type="button"
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-50 flex items-center justify-center gap-2 w-full transition-colors"
        >
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
        </button>
    );
};

export default GoogleLoginButton;