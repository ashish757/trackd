import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { tokenManager } from '../utils/tokenManager';

interface RefreshResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        accessToken: string;
    };
}

// Mutex to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Base query with token header
const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3000/auth',
    credentials: 'include', // CRITICAL: Send HttpOnly cookies automatically
    prepareHeaders: (headers) => {
        // Get access token from memory (not localStorage)
        const token = tokenManager.getAccessToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers;
    },
})

// Add Reauth logic with race condition protection
export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // Check if token is expired before making request (proactive refresh)
    if (tokenManager.isTokenExpired(60)) {
        console.log('🔄 Access token expired/expiring soon, refreshing proactively...');

        // Use mutex to prevent race conditions
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = (async () => {
                const refreshResult = await baseQuery(
                    {
                        url: '/refresh-token',
                        method: 'POST',
                        // No body needed - refresh token is in HttpOnly cookie
                    },
                    api,
                    extraOptions
                );

                if (refreshResult?.data) {
                    const responseData = refreshResult.data as RefreshResponse;
                    const newAccessToken = responseData.data.accessToken;

                    // Store new access token in memory
                    tokenManager.setAccessToken(newAccessToken);
                    console.log('✅ Token refreshed successfully');
                } else {
                    // Refresh failed, clear token and redirect to login
                    console.error('❌ Token refresh failed');
                    tokenManager.clearAccessToken();
                    window.location.href = '/signin';
                }
            })();

            try {
                await refreshPromise;
            } catch (error) {
                console.error('❌ Token refresh error:', error);
                tokenManager.clearAccessToken();
                window.location.href = '/signin';
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        } else {
            // Wait for ongoing refresh to complete
            await refreshPromise;
        }
    }

    // Make the actual request
    let result = await baseQuery(args, api, extraOptions)

    // If still get 401, try to refresh one more time
    if (result?.error?.status === 401) {
        console.warn('⚠️ Received 401, attempting token refresh...')

        // Use mutex to prevent race conditions
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = (async () => {
                const refreshResult = await baseQuery(
                    {
                        url: '/refresh-token',
                        method: 'POST',
                    },
                    api,
                    extraOptions
                );

                if (refreshResult?.data) {
                    const responseData = refreshResult.data as RefreshResponse;
                    const newAccessToken = responseData.data.accessToken;

                    tokenManager.setAccessToken(newAccessToken);
                    console.log('✅ Token refreshed after 401');

                    // Retry original request with new token
                    result = await baseQuery(args, api, extraOptions)
                } else {
                    console.error('❌ Refresh failed after 401');
                    tokenManager.clearAccessToken();
                    window.location.href = '/signin';
                }
            })();

            try {
                await refreshPromise;
            } catch (error) {
                console.error('❌ Refresh error after 401:', error);
                tokenManager.clearAccessToken();
                window.location.href = '/signin';
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        } else {
            // Wait for ongoing refresh to complete, then retry
            await refreshPromise;
            result = await baseQuery(args, api, extraOptions);
        }
    }

    return result
}
