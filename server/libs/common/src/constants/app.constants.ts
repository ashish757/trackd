/**
 * Application-wide constants
 * Shared across all microservices
 */

/**
 * Bcrypt salt rounds for password hashing
 * Default: 10 (can be overridden by environment variable)
 */
export const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS) || 10;

/**
 * JWT Token expiration times
 */
export const JWT_EXPIRATION = {
    ACCESS_TOKEN: '15m',
    REFRESH_TOKEN: '7d',
    OTP_TOKEN: '10m',
    EMAIL_VERIFICATION_TOKEN: '15m',
    PASSWORD_RESET_TOKEN: '1h',
} as const;

/**
 * Cookie expiration times (in milliseconds)
 */
export const COOKIE_MAX_AGE = {
    REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
    OAUTH_STATE: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
    OTP_SEND: {
        MAX_ATTEMPTS: 3,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
    LOGIN: {
        MAX_ATTEMPTS: 5,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
    API_GLOBAL: {
        MAX_REQUESTS: 100,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    },
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

/**
 * Validation constraints
 */
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    BIO_MAX_LENGTH: 160,
    NAME_MAX_LENGTH: 50,
} as const;

