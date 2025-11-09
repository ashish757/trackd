import {Controller, Get, Post, Body, HttpException, InternalServerErrorException} from '@nestjs/common';
import { AppService } from './app.service';
import { sendEmail } from './utils/email';
import {OtpTestDto} from "./modules/auth/DTO/register.dto";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}


    @Get('/health')
    async health() {
        return {
            status: 'success',
            message: 'Service is healthy',
            timestamp: new Date().toISOString(),
        };
    }

    @Post('/test-email-otp')
    async testEmail(@Body() body: OtpTestDto) {
        console.log(body.email);
        const result = await sendEmail(body.email, "Testing OTP", "OTP - 999999");
        if(!result.success) throw new InternalServerErrorException(result.message);

        return result;
    }
}
