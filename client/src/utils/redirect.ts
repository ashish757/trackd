/**
 * Redirect Validation Utilities
 *
 * Provides safe redirect handling to prevent open redirect vulnerabilities
 */

/**
 * Validates if a redirect URL is safe to use
 *
 * Rules:
 * 1. Must be a relative path (starts with /)
 * 2. Must not be a protocol-relative URL (starts with //)
 * 3. Must not contain javascript: or data: protocols
 */
export const isValidRedirectUrl = (url: string | null): boolean => {
    if (!url) return false;

    // Must start with / (relative path)
    if (!url.startsWith('/')) return false;

    // Must not be protocol-relative URL (//)
    if (url.startsWith('//')) return false;

    // Prevent javascript: and data: protocols (XSS)
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('javascript:') || lowerUrl.includes('data:')) return false;

    return true;
};


// Gets a safe redirect URL from query parameters
export const getSafeRedirect = (
    redirectParam: string | null,
    defaultRedirect: string = '/home'
): string => {
    if (!redirectParam) return defaultRedirect;

    if (isValidRedirectUrl(redirectParam)) {
        return redirectParam;
    }

    console.warn('Invalid redirect URL detected:', redirectParam);
    return defaultRedirect;
};

// Creates a signin URL with redirect parameter
export const createSigninUrl = (currentPath: string): string => {
    if (!isValidRedirectUrl(currentPath)) {
        return '/signin';
    }
    return `/signin?redirect=${encodeURIComponent(currentPath)}`;
};

// Creates a signup URL with redirect parameter
export const createSignupUrl = (currentPath: string): string => {
    if (!isValidRedirectUrl(currentPath)) {
        return '/signup';
    }
    return `/signup?redirect=${encodeURIComponent(currentPath)}`;
};

