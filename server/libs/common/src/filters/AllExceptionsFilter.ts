import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger: CustomLoggerService;

    constructor() {
        this.logger = new CustomLoggerService();
        this.logger.setContext(AllExceptionsFilter.name);
    }

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';

        // Handle NestJS HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || exception.message;
            }
        }
        // Handle Prisma errors
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            status = this.handlePrismaError(exception);
            message = this.getPrismaErrorMessage(exception);
        }
        else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid data provided';
        }
        else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Database error occurred';
        }
        // Handle generic errors
        else if (exception instanceof Error) {
            message = exception.message || 'Internal server error';
        }

        // Log the error for debugging
        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: message,
            userAgent: request.get('user-agent'),
            ip: request.ip,
            ...(status >= 500 && { stack: exception.stack }), // Include stack trace for server errors
        };

        if (status >= 500) {
            this.logger.error('Server Error', exception.stack, errorLog);
        } else if (status >= 400) {
            this.logger.warn('Client Error', errorLog);
        }

        // Send consistent error response
        response.status(status).json({
            status: status < 500 ? 'error' : 'fail',
            statusCode: status,
            message,
            ...(process.env.ENV !== 'production' && status >= 500 && { stack: exception.stack }), // Include stack in dev
        });
    }

    private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): number {
        switch (error.code) {
            case 'P2002': // Unique constraint violation
                return HttpStatus.CONFLICT;
            case 'P2025': // Record not found
                return HttpStatus.NOT_FOUND;
            case 'P2003': // Foreign key constraint failed
                return HttpStatus.BAD_REQUEST;
            case 'P2014': // Relation violation
                return HttpStatus.BAD_REQUEST;
            default:
                return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }

    private getPrismaErrorMessage(error: Prisma.PrismaClientKnownRequestError): string {
        switch (error.code) {
            case 'P2002':
                const target = (error.meta?.target as string[]) || [];
                return `A record with this ${target.join(', ')} already exists`;
            case 'P2025':
                return 'Record not found';
            case 'P2003':
                return 'Invalid reference to related record';
            case 'P2014':
                return 'The change you are trying to make would violate a relation';
            default:
                return 'Database operation failed';
        }
    }
}
