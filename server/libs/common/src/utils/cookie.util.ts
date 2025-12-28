import { Response } from 'express';
import { CookieOptions } from 'express';

/**
 * Centralized cookie configuration for the application
 * Used across all microservices for consistent cookie handling
 */
export class CookieConfig {
    private static getCookieOptions(isProduction?: boolean): CookieOptions {
        const isProd = isProduction ?? process.env.ENV === 'production';

        return {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
        };
    }

    /**
     * Set refresh token cookie with consistent options
     * @param res - Express Response object
     * @param refreshToken - JWT refresh token
     * @param maxAge - Cookie expiration in milliseconds (default: 7 days)
     */
    static setRefreshTokenCookie(
        res: Response,
        refreshToken: string,
        maxAge: number = 7 * 24 * 60 * 60 * 1000
    ): void {
        res.cookie('refreshToken', refreshToken, {
            ...this.getCookieOptions(),
            maxAge,
        });
    }

    /**
     * Set OAuth state cookie for CSRF protection
     * @param res - Express Response object
     * @param state - OAuth state token
     * @param maxAge - Cookie expiration in milliseconds (default: 15 minutes)
     */
    static setOAuthStateCookie(
        res: Response,
        state: string,
        maxAge: number = 15 * 60 * 1000
    ): void {
        res.cookie('oauth_state', state, {
            ...this.getCookieOptions(),
            maxAge,
        });
    }

    /**
     * Clear refresh token cookie
     * @param res - Express Response object
     */
    static clearRefreshTokenCookie(res: Response): void {
        res.clearCookie('refreshToken', this.getCookieOptions());
    }

    /**
     * Clear OAuth state cookie
     * @param res - Express Response object
     */
    static clearOAuthStateCookie(res: Response): void {
        res.clearCookie('oauth_state', this.getCookieOptions());
    }
}

