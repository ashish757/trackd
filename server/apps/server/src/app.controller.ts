import {Controller, Get, Post, Body, Req, InternalServerErrorException, Logger, HttpStatus} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(private readonly appService: AppService) {}


    @Get('health')
    health() {
        return {
            name: 'Main Server',
            status: 'ok',
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: 'Main Server is running',
        };
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
