import {Controller, Res, Post, Body, HttpStatus, BadRequestException, UnauthorizedException} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import {OtpDto, RegisterDto} from './DTO/register.dto';
import { LoginDto } from './DTO/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    // { accessToken: string; refreshToken: string }
    @Post('/login')
    login(@Body() req: LoginDto, @Res() res: Response) {
        const data = this.authService.login(req);
        return res.status(HttpStatus.OK).json({
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Login successful',
            data: data,
        });
    }

    @Post('/register')
    register(@Body() req: RegisterDto, @Res() res: Response) {

        const verify =  this.authService.verifyOtp({token: req.otpToken, email: req.user.email, otp: req.otp});
        if(!verify){
            throw new UnauthorizedException('Wrong OTP');
        }
        const data = this.authService.register(req.user);

        return res.status(HttpStatus.OK).json({
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'User Registered successfully',
            data: data,
        });
    }

    @Post('/send-otp')
    async sendOtp(@Body() req: OtpDto, @Res() res: Response) {
        const data = await this.authService.sendOtp(req);
        return res.status(HttpStatus.OK).json({
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'OTP sent',
            data: data,
        });
    }

    // @Post('/verify-otp')
    // verifyOtp(@Body() req: { otpToken: string; otp: number; user: RegisterDto }) {
    //     const data =  this.authService.verifyOtp(req);
    //     return res.status(HttpStatus.OK).json({
    //         status: 'success',
    //         statusCode: HttpStatus.OK,
    //         message: 'OTP sent',
    //         data: data,
    //     });
    // }
}
