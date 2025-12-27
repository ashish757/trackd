import { Response } from 'express';
import { CookieOptions } from 'express';

/**
 * Centralized cookie configuration for the application
 */
export class CookieConfig {
    private static getCookieOptions(): CookieOptions {
        const isProduction = process.env.ENV === 'production';

        return {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
        };
    }


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

    static clearRefreshTokenCookie(res: Response): void {
        res.clearCookie('refreshToken', this.getCookieOptions());
    }

    static clearOAuthStateCookie(res: Response): void {
        res.clearCookie('oauth_state', this.getCookieOptions());
    }
}

