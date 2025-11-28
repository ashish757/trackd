import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Properly extract message from HttpException
        let message: string;
        if (exception instanceof HttpException) {
            const exceptionResponse = exception.getResponse();
            message = typeof exceptionResponse === 'string'
                ? exceptionResponse
                : (exceptionResponse as any).message || exception.message;
        } else {
            message = exception.message || 'Internal server error';
        }

        response.status(status).json({
            status: status < 500 ? 'error' : 'fail',
            statusCode: status,
            message,
        });
    }
}
