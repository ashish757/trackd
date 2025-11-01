import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

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
}
