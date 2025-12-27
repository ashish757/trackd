import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

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

        // Log the error for debugging
        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: message,
            ...(status >= 500 && { stack: exception.stack }), // Include stack trace for server errors
        };

        if (status >= 500) {
            this.logger.error('Server Error:', JSON.stringify(errorLog, null, 2));
        } else {
            this.logger.warn('Client Error:', JSON.stringify(errorLog, null, 2));
        }

        // Send consistent error response
        response.status(status).json({
            status: status < 500 ? 'error' : 'fail',
            statusCode: status,
            message,
        });
    }
}
