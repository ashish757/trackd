import {Controller, Get, Post, Body, Req, InternalServerErrorException, Logger} from '@nestjs/common';
import { AppService } from './app.service';
import { sendEmail } from './utils/email';
import {OtpTestDto} from "../../auth-app/src/modules/auth/DTO/register.dto";
import { otpTemplate } from './utils/emailTemplates';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(private readonly appService: AppService) {}


    @Get('health')
    health() {
        return { status: 'ok' };
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
