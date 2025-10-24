import {Controller, Request, Req, Post, Body} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {RegisterDto} from "./DTO/register.dto";
import {LoginDto} from "./DTO/login.dto";

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    login(@Body() request: LoginDto): { accessToken: string; refreshToken: string } {
        return this.authService.login(request);
    }

    @Post('/register')
    register(@Body() request : RegisterDto): { accessToken: string; refreshToken: string }  {
        return this.authService.register(request);
    }

    @Post('/send-otp')
    async sendOtp(@Body() request: RegisterDto): Promise<{ statusCode: number,  otpToken: string }>  {
        return await this.authService.sendOtp(request);
    }

    @Post('/verify-otp')
    verifyOtp(@Body() request: { otpToken: string, otp: number, user: RegisterDto} ): { status: boolean; message?: string }  {
        return this.authService.verifyOtp(request);
    }



}
