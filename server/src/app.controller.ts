import {Controller, Get, Post, Body, Req, InternalServerErrorException, Logger} from '@nestjs/common';
import { AppService } from './app.service';
import { sendEmail } from './utils/email';
import {OtpTestDto} from "./modules/auth/DTO/register.dto";
import { otpTemplate } from './utils/emailTemplates';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

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
        this.logger.log(`Testing email for: ${body.email}`);
        const result = await sendEmail(
            body.email,
            "Test: OTP Verification - Trackd",
            otpTemplate("Test User", "123456")
        );
        if(!result) {
            throw new InternalServerErrorException('Failed to send test email');
        }
        return { success: true, message: 'Test email sent successfully' };
    }

    @Get('/geo/detect')
    async detectCountry(@Req() req: Request) {
        const country = await this.appService.detectCountry(req);

        return {
            status: 200,
            statusCode: 200,
            country: country,
        };
    }
}
