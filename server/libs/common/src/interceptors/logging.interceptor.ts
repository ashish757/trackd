import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger: CustomLoggerService;

    constructor() {
        this.logger = new CustomLoggerService();
        this.logger.setContext('HTTP');
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const { method, url, ip, headers } = request;

        // Generate request ID if not exists
        const requestId = headers['x-request-id'] || this.generateRequestId();
        request.headers['x-request-id'] = requestId as string;

        const userAgent = headers['user-agent'] || 'unknown';
        const userId = (request as any).user?.sub || 'anonymous';

        const startTime = Date.now();

        this.logger.log(
            `Incoming ${method} ${url} - RequestID: ${requestId} - User: ${userId} - IP: ${ip}`
        );

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const duration = Date.now() - startTime;
                    const { statusCode } = response;
                    const statusColor = this.getStatusColor(statusCode);

                    this.logger.log(
                        `Completed ${method} ${url} ${statusColor}${statusCode}\x1b[0m - ${duration}ms - RequestID: ${requestId}`
                    );
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    const statusCode = error.status || 500;
                    const statusColor = this.getStatusColor(statusCode);

                    this.logger.error(
                        `Failed ${method} ${url} ${statusColor}${statusCode}\x1b[0m - ${duration}ms - RequestID: ${requestId}`,
                        error.stack
                    );
                },
            })
        );
    }

    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    private getStatusColor(status: number): string {
        if (status >= 500) return '\x1b[31m'; // Red
        if (status >= 400) return '\x1b[33m'; // Yellow
        if (status >= 300) return '\x1b[36m'; // Cyan
        if (status >= 200) return '\x1b[32m'; // Green
        return '\x1b[0m';
    }
}

