/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */


// Base URL logic: use localhost for development, env variable for production
const getBaseUrl = (): string => {
        return import.meta.env.VITE_ENV == "development" ? "http://localhost:3000" : import.meta.env.VITE_API_BASE_URL;
            // || 'http://localhost:3000';
};

export const API_CONFIG = {
    // Base URL for the API server
    BASE_URL: getBaseUrl(),

    // API endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            SEND_OTP: '/auth/send-otp',
            VERIFY_OTP: '/auth/verify-otp',
            REFRESH_TOKEN: '/auth/refresh-token',
            FORGET_PASSWORD: '/auth/forget-password',
            RESET_PASSWORD: '/auth/reset-password',
        },
        USER: {
            CHANGE_USERNAME: 'user/change-username',
            CHANGE_PASSWORD: 'user/change-password',
        },
        MOVIE: {
            SEARCH: '/movies/search',
        },
    },

    // Request settings
    TIMEOUT: 30000, // 30 seconds

    // Retry settings
    MAX_RETRIES: 3,
} as const;


