import { Injectable, LoggerService as NestLoggerService, LogLevel } from '@nestjs/common';

export enum LogContext {
    AUTH = 'Auth',
    USER = 'User',
    FRIEND = 'Friend',
    MOVIE = 'Movie',
    NOTIFICATION = 'Notification',
    REDIS = 'Redis',
    DATABASE = 'Database',
    EMAIL = 'Email',
    WEBSOCKET = 'WebSocket',
    HTTP = 'HTTP',
    SYSTEM = 'System',
}

interface LogMetadata {
    userId?: string;
    requestId?: string;
    duration?: number;
    [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements NestLoggerService {
    private context: string = 'Application';

    setContext(context: string) {
        this.context = context;
    }

    /**
     * Log informational messages
     */
    log(message: string, metadata?: LogMetadata) {
        this.printLog('LOG', message, metadata);
    }

    /**
     * Log error messages
     */
    error(message: string, trace?: string, metadata?: LogMetadata) {
        this.printLog('ERROR', message, { ...metadata, trace });
    }

    /**
     * Log warning messages
     */
    warn(message: string, metadata?: LogMetadata) {
        this.printLog('WARN', message, metadata);
    }

    /**
     * Log debug messages (only in development)
     */
    debug(message: string, metadata?: LogMetadata) {
        if (process.env.ENV !== 'production') {
            this.printLog('DEBUG', message, metadata);
        }
    }

    /**
     * Log verbose messages (only in development)
     */
    verbose(message: string, metadata?: LogMetadata) {
        if (process.env.ENV !== 'production') {
            this.printLog('VERBOSE', message, metadata);
        }
    }

    /**
     * Log HTTP requests
     */
    logRequest(method: string, url: string, statusCode: number, duration: number, metadata?: LogMetadata) {
        const statusColor = this.getStatusColor(statusCode);
        const message = `${method} ${url} ${statusColor}${statusCode}\x1b[0m - ${duration}ms`;
        this.printLog('HTTP', message, metadata);
    }

    /**
     * Log database queries (for debugging)
     */
    logQuery(query: string, duration: number, metadata?: LogMetadata) {
        if (process.env.ENV !== 'production') {
            this.printLog('DATABASE', `Query executed in ${duration}ms`, { ...metadata, query });
        }
    }

    /**
     * Log authentication events
     */
    logAuth(event: string, userId?: string, metadata?: LogMetadata) {
        this.printLog('AUTH', event, { ...metadata, userId });
    }

    /**
     * Log business logic events
     */
    logEvent(event: string, metadata?: LogMetadata) {
        this.printLog('EVENT', event, metadata);
    }

    /**
     * Core logging function with formatting
     */
    private printLog(level: string, message: string, metadata?: LogMetadata) {
        const timestamp = new Date().toISOString();
        const levelColor = this.getLevelColor(level);
        const contextColor = '\x1b[33m'; // Yellow
        const resetColor = '\x1b[0m';

        // Format: [Timestamp] [Level] [Context] Message {metadata}
        let logLine = `[${timestamp}] ${levelColor}[${level}]${resetColor} ${contextColor}[${this.context}]${resetColor} ${message}`;

        // Add metadata if present
        if (metadata && Object.keys(metadata).length > 0) {
            const filteredMetadata = this.filterSensitiveData(metadata);
            logLine += ` ${JSON.stringify(filteredMetadata)}`;
        }

        // Output based on level
        switch (level) {
            case 'ERROR':
                console.error(logLine);
                break;
            case 'WARN':
                console.warn(logLine);
                break;
            case 'DEBUG':
            case 'VERBOSE':
                console.debug(logLine);
                break;
            default:
                console.log(logLine);
        }
    }

    /**
     * Get color code for log level
     */
    private getLevelColor(level: string): string {
        const colors: Record<string, string> = {
            ERROR: '\x1b[31m',    // Red
            WARN: '\x1b[33m',     // Yellow
            LOG: '\x1b[32m',      // Green
            DEBUG: '\x1b[36m',    // Cyan
            VERBOSE: '\x1b[35m',  // Magenta
            HTTP: '\x1b[34m',     // Blue
            DATABASE: '\x1b[35m', // Magenta
            AUTH: '\x1b[32m',     // Green
            EVENT: '\x1b[36m',    // Cyan
        };
        return colors[level] || '\x1b[0m';
    }

    /**
     * Get color code for HTTP status
     */
    private getStatusColor(status: number): string {
        if (status >= 500) return '\x1b[31m'; // Red
        if (status >= 400) return '\x1b[33m'; // Yellow
        if (status >= 300) return '\x1b[36m'; // Cyan
        if (status >= 200) return '\x1b[32m'; // Green
        return '\x1b[0m';
    }

    /**
     * Filter sensitive data from logs
     */
    private filterSensitiveData(metadata: LogMetadata): LogMetadata {
        const sensitiveKeys = ['password', 'token', 'refreshToken', 'accessToken', 'secret', 'otp'];
        const filtered = { ...metadata };

        for (const key of sensitiveKeys) {
            if (key in filtered) {
                filtered[key] = '***REDACTED***';
            }
        }

        // Also check nested objects
        for (const [key, value] of Object.entries(filtered)) {
            if (typeof value === 'object' && value !== null) {
                filtered[key] = this.filterSensitiveData(value as LogMetadata);
            }
        }

        return filtered;
    }
}

