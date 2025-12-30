import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { CustomLoggerService } from '../logger/custom-logger.service';

/**
 * Custom exception filter for rate limiting
 * Provides standardized response when rate limits are exceeded
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
    private readonly logger: CustomLoggerService;

    constructor() {
        this.logger = new CustomLoggerService();
        this.logger.setContext(ThrottlerExceptionFilter.name);
    }

    catch(exception: ThrottlerException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = HttpStatus.TOO_MANY_REQUESTS;

        // Extract useful information
        const { method, url, ip } = request;
        const userAgent = request.get('user-agent') || 'unknown';
        const userId = (request as any).user?.sub || 'anonymous';

        // Log the rate limit violation
        this.logger.warn('Rate limit exceeded', {
            ip,
            userId,
            method,
            url,
            userAgent,
            timestamp: new Date().toISOString(),
        });

        // Get rate limit headers if available
        const rateLimitHeaders = {
            limit: response.getHeader('X-RateLimit-Limit'),
            remaining: response.getHeader('X-RateLimit-Remaining'),
            reset: response.getHeader('X-RateLimit-Reset'),
        };

        // Calculate retry after time (default to 60 seconds)
        const retryAfter = this.calculateRetryAfter(rateLimitHeaders.reset);

        // Send standardized error response
        response.status(status).json({
            status: 'error',
            statusCode: status,
            message: 'Too many requests. Please slow down and try again later.',
            error: 'Rate Limit Exceeded',
            retryAfter: `${retryAfter} seconds`,
            timestamp: new Date().toISOString(),
            path: url,
            ...(process.env.ENV !== 'production' && {
                details: {
                    limit: rateLimitHeaders.limit,
                    remaining: rateLimitHeaders.remaining,
                    resetAt: rateLimitHeaders.reset
                        ? new Date(parseInt(rateLimitHeaders.reset as string) * 1000).toISOString()
                        : null,
                },
            }),
        });
    }

    /**
     * Calculate seconds until rate limit resets
     */
    private calculateRetryAfter(resetHeader: string | number | string[] | undefined): number {
        if (!resetHeader) {
            return 60; // Default to 60 seconds
        }

        try {
            const resetTime = typeof resetHeader === 'string'
                ? parseInt(resetHeader)
                : Array.isArray(resetHeader)
                ? parseInt(resetHeader[0])
                : resetHeader;

            const now = Math.floor(Date.now() / 1000);
            const retryAfter = resetTime - now;

            return retryAfter > 0 ? retryAfter : 60;
        } catch {
            return 60;
        }
    }
}

