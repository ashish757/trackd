/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */

// Type for environment
export type Environment = 'development' | 'production' | 'staging';

export const getEnvironment = (): Environment => {
    return (import.meta.env.ENV as Environment) || 'development';
};

export const isDevelopment = () => getEnvironment() === 'development';
export const isProduction = () => getEnvironment() === 'production';

// Base URL logic: use localhost for development, env variable for production
const getBaseUrl = (): string => {
    if (isProduction()) {
        // Production: use environment variable or throw error if not set
        const productionUrl = import.meta.env.VITE_API_URL;
        if (!productionUrl) {
            console.error('VITE_API_URL is not set in production environment!');
            return 'http://localhost:3000'; // Fallback
        }
        return productionUrl;
    } else {
        // Development: always use localhost
        return 'http://localhost:3000';
    }
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
        },
    },

    // Request settings
    TIMEOUT: 30000, // 30 seconds

    // Retry settings
    MAX_RETRIES: 3,
} as const;


