import {
    Controller,
    Post,
    Body,
    HttpStatus,
    UnauthorizedException,
    Res,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SendOtpDto, RegisterDto } from './DTO/register.dto';
import { LoginDto } from './DTO/login.dto';
import { AuthGuard } from '../../comman/guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    async login(@Body() req: LoginDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.authService.login(req);

        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.ENV === 'production', // HTTPS only in production
            sameSite: 'none',  // CSRF protection but our client is on a different domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

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

    @Post('/register')
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
        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

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
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        // Read refresh token from HttpOnly cookie
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const data = await this.authService.refreshToken(refreshToken);

        // Set new refresh token in HttpOnly cookie
        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

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

    @Post('/logout')
    @UseGuards(AuthGuard)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refreshToken;
        const user = (req as any).user; // Set by AuthGuard

        if (refreshToken && user) {
            await this.authService.logout(user.sub, refreshToken);
        }

        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Logged out successfully',
        };
    }
}
