import {
    Controller,
    Post,
    Body,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpDto, RegisterDto } from './DTO/register.dto';
import { LoginDto, RefreshTokenDto } from './DTO/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    // { accessToken: string; refreshToken: string }
    @Post('/login')
    async login(@Body() req: LoginDto) {
        const data = await this.authService.login(req);
        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Login successful',
            data: data,
        };
    }

    @Post('/register')
    async register(@Body() req: RegisterDto) {
        const verify = await this.authService.verifyOtp({
            token: req.otpToken,
            email: req.user.email,
            otp: req.otp,
        });
        if (!verify) {
            throw new UnauthorizedException('Wrong OTP');
        }
        const data = await this.authService.register(req.user);

        return {
            status: 'success',
            statusCode: HttpStatus.CREATED,
            message: 'User Registered successfully',
            data: data,
        };
    }

    @Post('/send-otp')
    async sendOtp(@Body() req: OtpDto) {
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
    async refreshToken(@Body() body: RefreshTokenDto) {
        const data = await this.authService.refreshToken(body.refreshToken);
        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Token refreshed successfully',
            data: data,
        };
    }
}
