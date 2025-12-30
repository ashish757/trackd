import {
    Controller,
    Post,
    Body,
    HttpStatus,
    UnauthorizedException,
    ForbiddenException,
    Res,
    Get,
    Req,
    UseGuards,
    Query,
    Logger
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
    SendOtpDto,
    RegisterDto,
    ForgetPasswordDto,
    ResetPasswordDto,
    ChangeEmailRequestDto,
    ChangeEmailDto
} from './DTO/register.dto';
import { LoginDto } from './DTO/login.dto';
import { AuthGuard } from '@app/common/guards/auth.guard';
import {OptionalAuthGuard} from "@app/common/guards/optionalAuth.guard";
import { CookieConfig, RateLimitConfig } from '@app/common';

interface AuthorizedRequest extends Request {
    user?: {
        sub: string;
        email: string;
    },
    isAuthenticated: boolean;
}

@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    @Throttle({ default: RateLimitConfig.STRICT.AUTH_LOGIN })
    async login(@Body() req: LoginDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.login(req);

        // Set refresh token in HttpOnly cookie
        CookieConfig.setRefreshTokenCookie(res, data.refreshToken);

        // Only send access token in response body
        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Login successful',
            data: {
                accessToken: data.accessToken,
               user: data.user,
            },
        };
    }

    @Post('/forget-password')
    @Throttle({ default: RateLimitConfig.STRICT.PASSWORD_RESET_REQUEST })
    async forgetPassword(@Body() req: ForgetPasswordDto) {
        const data = await this.authService.forgetPassword(req);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: data,
        };
    }

    @Post('/reset-password')
    @Throttle({ default: RateLimitConfig.STRICT.PASSWORD_RESET_CONFIRM })
    async resetPassword(@Body() req: ResetPasswordDto) {
        const data = await this.authService.resetPassword(req);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: data,
        };
    }

    @Post('/register')
    @Throttle({ default: RateLimitConfig.STRICT.AUTH_REGISTER })
    async register(@Body() req: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const verify = await this.authService.verifyOtp({
            token: req.otpToken,
            email: req.user.email,
            otp: req.otp,
        });
        if (!verify) {
            throw new UnauthorizedException('Wrong OTP');
        }
        const data = await this.authService.register(req.user);

        // Set refresh token in HttpOnly cookie
        CookieConfig.setRefreshTokenCookie(res, data.refreshToken);

        return {
            status: 'success',
            statusCode: HttpStatus.CREATED,
            message: 'User Registered successfully',
            data: {
                accessToken: data.accessToken,
                user:
                    {
                        name: data.user.name,
                        email: data.user.email,
                        id: data.user.id
                    }
            },
        };
    }

    @Post('/send-otp')
    @Throttle({ default: RateLimitConfig.STRICT.SEND_OTP })
    async sendOtp(@Body() req: SendOtpDto) {
        const data = await this.authService.sendOtp(req);
        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'OTP sent',
            data: data,
        };
    }

    @Post('/verify-otp')
    @Throttle({ default: RateLimitConfig.STRICT.VERIFY_OTP })
    async verifyOtp(@Body() req: RegisterDto) {
        const data = await this.authService.verifyOtp({token: req.otpToken, email: req.user.email, otp: req.otp});
        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'OTP Verified',
            data: data,
        };
    }

    @Post('/refresh-token')
    @Throttle({ default: RateLimitConfig.CUSTOM.REFRESH_TOKEN })
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        // Read refresh token from HttpOnly cookie
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const data = await this.authService.refreshToken(refreshToken);

        // Set new refresh token in HttpOnly cookie
        CookieConfig.setRefreshTokenCookie(res, data.refreshToken);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Token refreshed successfully',
            data: {
                accessToken: data.accessToken,
                user: data.user,
            },
        };
    }

    @Post('/change/email/request')
    @Throttle({ default: RateLimitConfig.STRICT.EMAIL_CHANGE_REQUEST })
    @UseGuards(AuthGuard)
    async changeEmailRequest(@Body() dto: ChangeEmailRequestDto, @Req() req: AuthorizedRequest) {
        const userId = req.user.sub;
        const data = await this.authService.changeEmailRequest(dto, userId, req.user.email);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: data,
        };
    }

    @Post('/change/email')
    @UseGuards(OptionalAuthGuard)
    async changeEmail(@Body() dto: ChangeEmailDto, @Req() req: AuthorizedRequest, @Res({ passthrough: true }) res: Response) {

        const data = await this.authService.changeEmail(dto, req.isAuthenticated, req?.user.sub);

        // Set new refresh token in HttpOnly cookie
        CookieConfig.setRefreshTokenCookie(res, data.refreshToken);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            data: {
                accessToken: data.accessToken,
                user: data.user,
                message: data.message,
            },
        }
    }

    @Post('/logout')
    @UseGuards(AuthGuard)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refreshToken;
        const user = (req as any).user; // Set by AuthGuard

        // Extract access token from Authorization header
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader ? authHeader.split(' ')[1] : undefined;

        if (refreshToken && user) {
            await this.authService.logout(user.sub, refreshToken, accessToken);
        }

        // Clear refresh token cookie
        CookieConfig.clearRefreshTokenCookie(res);

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Logged out successfully',
        };
    }

    // Route 1: Trigger (Frontend links here)
    @Get('google')
    async googleAuth(@Res() res: Response) {
        const {url, state} = this.authService.getGoogleAuthURL();

        CookieConfig.setOAuthStateCookie(res, state);

        return res.redirect(url);
    }

    // Route 2: Callback (Google sends code here)
    @Get('google/callback')
    async googleAuthCallback(@Query('state') state: string, @Query('code') code: string, @Res() res: Response, @Req() req: Request) {
        try {
            // SECURITY CHECK: Validate State
            const savedState = req.cookies['oauth_state'];

            if (!savedState || savedState !== state) {
                throw new ForbiddenException('Invalid State: Login request did not originate from this browser.');
            }

            // Cleanup: Clear the state cookie (it's one-time use)
            CookieConfig.clearOAuthStateCookie(res);

            if (!code) {
                if (process.env.ENV === 'production') return res.redirect(`${process.env.FRONTEND_URL}/signin?error=missing_code`);
                else return res.redirect(`${process.env.FRONTEND_URL_DEV}/signin?error=missing_code`);
            }

            const { accessToken, refreshToken } = await this.authService.googleLogin(code);

            // Set refresh token in HttpOnly cookie (SECURE!)
            CookieConfig.setRefreshTokenCookie(res, refreshToken);

            // Redirect to frontend OAuth success page with only accessToken in URL
            // The frontend will then store it in memory and fetch user data
            let redirectUrl: string;
            if(process.env.ENV === 'production') redirectUrl = `${process.env.FRONTEND_URL}/oauth/success?accessToken=${encodeURIComponent(accessToken)}`;
            else redirectUrl = `${process.env.FRONTEND_URL_DEV}/oauth/success?accessToken=${encodeURIComponent(accessToken)}`;
            return res.redirect(redirectUrl);

        } catch (error) {
            this.logger.error('OAuth Callback Error:', error);
            // Provide more specific error messages
            const errorMessage = error?.message || 'oauth_failed';

            let redirectUrl: string;
            if(process.env.ENV === 'production') redirectUrl = `${process.env.FRONTEND_URL}/signin?error=${encodeURIComponent(errorMessage)}`;
            else redirectUrl = `${process.env.FRONTEND_URL_DEV}/signin?error=${encodeURIComponent(errorMessage)}`;
            return res.redirect(redirectUrl);
        }
    }



}
