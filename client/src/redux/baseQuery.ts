import {type BaseQueryApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import type {BaseQueryFn, FetchArgs, FetchBaseQueryError} from '@reduxjs/toolkit/query';
import {tokenManager} from '../utils/tokenManager';
import {API_CONFIG} from '../config/api.config';
import {logout, setUser} from './auth/authSlice';
import {addToast} from './toast/toastSlice';
import type {User} from './user/userApi';
import logger from '../utils/logger';


/**
 * Response structure from the refresh token endpoint
 */
interface RefreshResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        accessToken: string;
        user: User;
    };
}

/**
 * Constants
 */
const TOKEN_EXPIRY_THRESHOLD_SECONDS = 60; // Refresh token 60 seconds before expiry
const AUTH_ENDPOINTS = ['/login', '/register', '/send-otp', '/verify-otp'] as const;

/**
 * Mutex to prevent multiple simultaneous refresh requests
 */
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Base query configuration with automatic token injection
 */
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    credentials: 'include', // Send HttpOnly cookies automatically
    prepareHeaders: (headers) => {
        const token = tokenManager.getAccessToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        const country = localStorage.getItem('country');
        if (country) {
            headers.set('x-user-location', country);
        }
        return headers;
    },
});

/**
 * Check if the current request is to an authentication endpoint
 */
const isAuthenticationEndpoint = (url: string): boolean => {
    return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

/**
 * Handle successful token refresh
 */
const handleSuccessfulRefresh = (
    responseData: RefreshResponse,
    api: BaseQueryApi
): void => {
    const { accessToken, user } = responseData.data;

    tokenManager.setAccessToken(accessToken);

    if (user) {
        api.dispatch(setUser(user));
    }

    logger.log('Token refreshed successfully');
};

/**
 * Handle failed token refresh
 */
const handleFailedRefresh = (api: BaseQueryApi, errorMessage: string): void => {
    logger.error(`${errorMessage}`);
    tokenManager.clearAccessToken();
    api.dispatch(logout());
};

/**
 * Execute the token refresh request
 */
const executeTokenRefresh = async (
    api: BaseQueryApi,
    extraOptions: object
): Promise<boolean> => {
    const refreshResult = await baseQuery(
        {
            url: API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
            method: 'POST',
        },
        api,
        extraOptions
    );

    if (refreshResult?.data) {
        const responseData = refreshResult.data as RefreshResponse;
        handleSuccessfulRefresh(responseData, api);
        return true;
    }

    handleFailedRefresh(api, 'Token refresh failed');
    return false;
};

/**
 * Attempt to refresh the access token with mutex protection
 */
const tryRefreshToken = async (
    api: BaseQueryApi,
    extraOptions: object
): Promise<void> => {
    if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = (async () => {
            try {
                await executeTokenRefresh(api, extraOptions);
            } catch (error) {
                handleFailedRefresh(api, `Token refresh error: ${error}`);
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();
    }

    // Wait for ongoing or just-started refresh to complete
    await refreshPromise;
};

/**
 * Handle 401 error by attempting token refresh and retrying the request
 */
const handle401Error = async (
    args: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: object
): Promise<ReturnType<typeof baseQuery>> => {
    logger.warn('Received 401, attempting token refresh...');

    if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = (async () => {
            try {
                const success = await executeTokenRefresh(api, extraOptions);

                if (!success) {
                    return;
                }

                logger.log('Token refreshed after 401');
            } catch (error) {
                handleFailedRefresh(api, `Refresh error after 401: ${error}`);
                return;
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();
    }

    // Wait for refresh to complete
    await refreshPromise;

    // Retry the original request with the new token
    return baseQuery(args, api, extraOptions);
};

/**
 * Base query with automatic token refresh and reauthentication logic
 */
export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api: BaseQueryApi, extraOptions) => {
    logger.log('baseQueryWithReauth called with:', {
        args,
        hasToken: tokenManager.getAccessToken() !== null,
    });

    const hasToken = tokenManager.getAccessToken() !== null;

    // Proactive token refresh if token is expiring soon
    if (hasToken && tokenManager.isTokenExpired(TOKEN_EXPIRY_THRESHOLD_SECONDS)) {
        logger.log('Access token expired/expiring soon, refreshing proactively...');
        await tryRefreshToken(api, extraOptions);
    }

    // Execute the actual request
    logger.log('Making request to baseQuery...');
    let result = await baseQuery(args, api, extraOptions);

    logger.log('baseQuery result:', {
        hasError: !!result.error,
        status: result.error?.status,
        data: result.data,
    });

    // Handle rate limit errors (429)
    if (result?.error?.status === 429) {
        const errorData = result.error.data as { retryAfter?: string; message?: string };
        const retryAfter = errorData?.retryAfter || '60 seconds';

        // Dispatch toast notification via Redux
        api.dispatch(addToast({
            message: `Too many requests. Please try again in ${retryAfter}.`,
            type: 'WARNING',
            duration: 10000, // Show for 10 seconds since it's important
        }));

        logger.warn('Rate limit exceeded:', errorData);
        return result;
    }

    // Handle 401 errors (except for authentication endpoints)
    const url = typeof args === 'string' ? args : args.url;
    const shouldRetryOn401 = result?.error?.status === 401 && !isAuthenticationEndpoint(url);

    if (shouldRetryOn401) {
        result = await handle401Error(args, api, extraOptions);
    }

    return result;
};
