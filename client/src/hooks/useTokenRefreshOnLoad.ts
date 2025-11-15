import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { API_CONFIG } from '../config/api.config';
import { tokenManager } from '../utils/tokenManager';
import { setUser } from '../redux/auth/authSlice';

/**
 * Custom hook to refresh access token on page load/reload
 *
 * This solves the problem where in-memory access tokens are lost on page refresh,
 * but the HttpOnly refresh token cookie persists.
 *
 * On mount, this hook will:
 * 1. Check if there's no access token in memory (page was reloaded)
 * 2. Attempt to refresh the token using the HttpOnly cookie
 * 3. Set the new access token and user details in Redux state
 *
 * @returns {boolean} isLoading - true while attempting token refresh, false when complete
 */
export const useTokenRefreshOnLoad = (): boolean => {
    const dispatch = useDispatch();
    const hasAttemptedRefresh = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isMounted = true;

        const attemptTokenRefresh = async () => {

            if (!isMounted) return;

            // Only attempt once per app load
            if (hasAttemptedRefresh.current) {
                return;
            }
            hasAttemptedRefresh.current = true;

            // Only attempt refresh if there's no access token in memory
            // This indicates a page reload (access token was lost)
            const hasAccessToken = tokenManager.getAccessToken() !== null;

            if (hasAccessToken) {
                console.log('Access token already exists in memory, skipping refresh');
                return;
            }

            console.log('No access token found in memory, attempting refresh on page load...');
            setIsLoading(true);

            try {
                const response = await fetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                    {
                        method: 'POST',
                        credentials: 'include', // Send HttpOnly cookies
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    if (data?.data?.accessToken) {
                        // Store new access token in memory
                        tokenManager.setAccessToken(data.data.accessToken);

                        // Update user details in Redux state
                        if (data.data.user) {
                            dispatch(setUser(data.data.user));
                        }

                        console.log('Token refreshed successfully on page load');
                    }
                } else {
                    // Refresh token is invalid or expired
                    console.log('No valid refresh token found (user not logged in or session expired)');
                    tokenManager.clearAccessToken();
                }
            } catch (error) {
                console.error('Failed to refresh token on page load:', error);
                tokenManager.clearAccessToken();
            } finally {
                setIsLoading(false);
            }
        };

        attemptTokenRefresh();
    }, [dispatch]);

    return isLoading;
};

