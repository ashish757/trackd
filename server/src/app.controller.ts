import {Controller, Get, Res,Req, HttpStatus} from '@nestjs/common';
import { AppService } from './app.service';
import type {Request, Response} from 'express';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get()
    health(@Req() _req: Request, @Res() res: Response) {
        return res.status(HttpStatus.OK).json({
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Service health good!',
        });
    }

}
