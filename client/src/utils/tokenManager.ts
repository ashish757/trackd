/**
 * Secure Token Manager
 *
 * - Access tokens stored in memory (not localStorage)
 * - Refresh tokens stored in HttpOnly cookies (not accessible to JS)
 * - Provides centralized token management
 */

// In-memory storage for access token (cleared on page refresh)
let accessToken: string | null = null;

interface JwtPayload {
    sub: number;
    email: string;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

export const tokenManager = {
    /**
     * Set access token in memory
     */
    setAccessToken: (token: string): void => {
        accessToken = token;
    },

    /**
     * Get access token from memory
     */
    getAccessToken: (): string | null => {
        return accessToken;
    },

    /**
     * Clear access token from memory
     */
    clearAccessToken: (): void => {
        accessToken = null;
    },

    /**
     * Check if user is authenticated (has access token)
     */
    isAuthenticated: (): boolean => {
        return !!accessToken;
    },

    /**
     * Decode JWT token to get payload (without verification)
     * For checking expiry time, user info, etc.
     */
    decodeToken: (token: string): JwtPayload | null => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload) as JwtPayload;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    },

    /**
     * Check if access token is expired or about to expire
     * @param bufferSeconds - Refresh if token expires within this many seconds (default: 60)
     */
    isTokenExpired: (bufferSeconds: number = 60): boolean => {
        if (!accessToken) return true;

        const decoded = tokenManager.decodeToken(accessToken);
        if (!decoded || !decoded.exp) return true;

        const expiryTime = decoded.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const bufferTime = bufferSeconds * 1000;

        return currentTime >= expiryTime - bufferTime;
    },

    /**
     * Get user info from access token
     */
    getUserFromToken: (): { sub: number; email: string } | null => {
        if (!accessToken) return null;
        return tokenManager.decodeToken(accessToken);
    },
};

