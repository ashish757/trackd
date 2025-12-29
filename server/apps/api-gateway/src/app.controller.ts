import {Controller, Get, Post, Body, Req, InternalServerErrorException, HttpStatus} from '@nestjs/common';
import { AppService } from './app.service';
import { CustomLoggerService } from '@app/common';

@Controller()
export class AppController {
    private readonly logger: CustomLoggerService;

    constructor(private readonly appService: AppService) {
        this.logger = new CustomLoggerService();
        this.logger.setContext(AppController.name);
    }


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
