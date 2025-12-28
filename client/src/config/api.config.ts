/**
 * API Configuration
 * Centralized configuration for API endpoints and base URLs
 */


// Base URL logic: use localhost for development, env variable for production
const getBaseUrl = (): string => {
        return import.meta.env.VITE_ENV == "development" ? "http://localhost:3000" : import.meta.env.VITE_API_BASE_URL;
};

export const API_CONFIG = {
    // Base URL for the API server
    BASE_URL: getBaseUrl(),

    // API endpoints
    ENDPOINTS: {
        DETECT_COUNTRY: '/geo/detect',
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            SEND_OTP: '/auth/send-otp',
            VERIFY_OTP: '/auth/verify-otp',
            REFRESH_TOKEN: '/auth/refresh-token',
            FORGET_PASSWORD: '/auth/forget-password',
            RESET_PASSWORD: '/auth/reset-password',
            REQUEST_CHANGE_EMAIL: '/auth/change/email/request',
            CHANGE_EMAIL: '/auth/change/email',
        },
        USER: {
            CHANGE_NAME: '/user/change/name',
            CHANGE_BIO: '/user/change/bio',
            CHANGE_USERNAME: '/user/change/username',
            CHANGE_PASSWORD: '/user/change/password',
            GET_USER: '/user',
            SEARCH_USERS: '/user/search',
            GET_USER_BY_ID: '/user/',
            FOLLOW: '/user/follow',
            UNFOLLOW: '/user/unfollow',
            CANCEL_FOLLOW_REQUEST: '/user/follow/cancel',
            ACCEPT_FOLLOW_REQUEST: '/user/follow/accept',
            REJECT_FOLLOW_REQUEST: '/user/follow/reject',
        },
        MOVIE: {
            SEARCH: '/movies/search',
            TRENDING: '/movies/trending',
            GET_BY_ID: '/movies',
        },
        USER_MOVIES: {
            MARK: '/user-movies/mark',
            DELETE: '/user-movies',
            GET_ALL: '/user-movies',
            GET_BY_STATUS: '/user-movies/by-status',
            GET_ENTRY: '/user-movies/movie',
            GET_STATS: '/user-movies/stats',
            RATE: '/user-movies/rate',
            GET_RATING: '/user-movies/rating',
            DELETE_RATING: '/user-movies/rating',
        },
        FRIEND: {
            GET_REQUESTS: '/friend/requests',
            GET_MY_FRIENDS: '/friend/my-friends',
            GET_MUTUAL: '/friend/mutual',
            GET_FRIEND_LIST: '/friend/list',
            GET_USER_MOVIES: '/friend/movies',
        },
        NOTIFICATIONS: {
            GET_ALL: '/notifications',
            GET_UNREAD_COUNT: '/notifications/unread-count',
            MARK_AS_READ: '/notifications',
            MARK_MULTIPLE_AS_READ: '/notifications/mark-multiple',
            MARK_ALL_AS_READ: '/notifications/read-all',
            DELETE: '/notifications',
            DELETE_ALL_READ: '/notifications/read/all',
        },
    },

    // Request settings
    TIMEOUT: 30000, // 30 seconds

    // Retry settings
    MAX_RETRIES: 3,
} as const;


