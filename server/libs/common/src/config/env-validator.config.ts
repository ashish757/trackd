import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidator');

export enum EnvVarSeverity {
    REQUIRED = 'REQUIRED',
    WARN = 'WARN',
}

export interface EnvVarConfig {
    name: string;
    severity: EnvVarSeverity;
    description: string;
    defaultValue?: string;
    validator?: (value: string) => boolean;
    validatorMessage?: string;
}

/**
 * Base environment variables required by all services
 */
export const BASE_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'DATABASE_URL',
        severity: EnvVarSeverity.REQUIRED,
        description: 'PostgreSQL database connection string',
    },
    {
        name: 'ENV',
        severity: EnvVarSeverity.REQUIRED,
        description: 'Environment type (production/development)',
        validator: (value) => ['production', 'development'].includes(value),
        validatorMessage: 'ENV must be either "production" or "development"',
    },
];

/**
 * Auth-related environment variables
 */
export const AUTH_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'JWT_ACCESS_SECRET',
        severity: EnvVarSeverity.REQUIRED,
        description: 'Secret key for JWT access tokens',
        validator: (value) => value.length >= 32,
        validatorMessage: 'JWT_ACCESS_SECRET must be at least 32 characters long',
    },
    {
        name: 'JWT_REFRESH_SECRET',
        severity: EnvVarSeverity.REQUIRED,
        description: 'Secret key for JWT refresh tokens',
        validator: (value) => value.length >= 32,
        validatorMessage: 'JWT_REFRESH_SECRET must be at least 32 characters long',
    },
    {
        name: 'JWT_OTP_SECRET',
        severity: EnvVarSeverity.REQUIRED,
        description: 'Secret key for OTP tokens',
        validator: (value) => value.length >= 32,
        validatorMessage: 'JWT_OTP_SECRET must be at least 32 characters long',
    },
];

/**
 * Email service environment variables
 */
export const EMAIL_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'RESEND_API_KEY',
        severity: EnvVarSeverity.WARN,
        description: 'Resend email service API key',
        validator: (value) => value.startsWith('re_'),
        validatorMessage: 'RESEND_API_KEY must be a valid Resend API key (starts with re_)',
    },
    {
        name: 'EMAIL_FROM',
        severity: EnvVarSeverity.WARN,
        description: 'Email sender address',
        defaultValue: 'Trackd <onboarding@resend.dev>',
    },
    {
        name: 'DEV_TEST_EMAIL',
        severity: EnvVarSeverity.WARN,
        description: 'Email address for testing in development',
        defaultValue: 'ashishrajsingh75@gmail.com',
    },
];

/**
 * Google OAuth environment variables
 */
export const OAUTH_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'GOOGLE_CLIENT_ID',
        severity: EnvVarSeverity.WARN,
        description: 'Google OAuth client ID',
        validator: (value) => value.includes('.apps.googleusercontent.com'),
        validatorMessage: 'GOOGLE_CLIENT_ID must be a valid Google OAuth client ID',
    },
    {
        name: 'GOOGLE_CLIENT_SECRET',
        severity: EnvVarSeverity.WARN,
        description: 'Google OAuth client secret',
    },
    {
        name: 'GOOGLE_CALLBACK_URL',
        severity: EnvVarSeverity.WARN,
        description: 'Google OAuth callback URL',
        validator: (value) => value.startsWith('http://') || value.startsWith('https://'),
        validatorMessage: 'GOOGLE_CALLBACK_URL must be a valid HTTP(S) URL',
    },
];

/**
 * Frontend URL environment variables
 */
export const FRONTEND_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'FRONTEND_URL',
        severity: EnvVarSeverity.REQUIRED,
        description: 'Production frontend URL',
        validator: (value) => value.startsWith('https://'),
        validatorMessage: 'FRONTEND_URL must be a valid HTTPS URL for production',
    },
    {
        name: 'FRONTEND_URL_DEV',
        severity: EnvVarSeverity.WARN,
        description: 'Development frontend URL',
        defaultValue: 'http://localhost:5173',
        validator: (value) => value.startsWith('http://') || value.startsWith('https://'),
        validatorMessage: 'FRONTEND_URL_DEV should be a valid HTTP(S) URL',
    },
];

/**
 * TMDB API environment variables
 */
export const TMDB_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'TMDB_ACCESS_TOKEN',
        severity: EnvVarSeverity.REQUIRED,
        description: 'TMDB API access token (Bearer token)',
    },
    {
        name: 'TMDB_API_KEY',
        severity: EnvVarSeverity.WARN,
        description: 'TMDB API key (v3 API - legacy, use ACCESS_TOKEN instead)',
    },
];

/**
 * Microservice port configuration
 */
export const MICROSERVICE_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'PORT',
        severity: EnvVarSeverity.WARN,
        description: 'Main server port number',
        defaultValue: '3000',
        validator: (value) => !isNaN(Number(value)) && Number(value) > 0 && Number(value) < 65536,
        validatorMessage: 'PORT must be a valid port number (1-65535)',
    },
    {
        name: 'AUTH_SERVICE_PORT',
        severity: EnvVarSeverity.WARN,
        description: 'Auth service port',
        defaultValue: '3002',
    },
    {
        name: 'USER_SERVICE_PORT',
        severity: EnvVarSeverity.WARN,
        description: 'User service port',
        defaultValue: '3004',
    },
    {
        name: 'MOVIE_SERVICE_PORT',
        severity: EnvVarSeverity.WARN,
        description: 'Movie service port',
        defaultValue: '3001',
    },
    {
        name: 'FRIEND_SERVICE_PORT',
        severity: EnvVarSeverity.WARN,
        description: 'Friend service port',
        defaultValue: '3003',
    },
    {
        name: 'USER_MOVIE_SERVICE_PORT',
        severity: EnvVarSeverity.WARN,
        description: 'User Movie service port',
        defaultValue: '3005',
    },
    {
        name: 'NOTIFICATION_SERVICE_PORT',
        severity: EnvVarSeverity.WARN,
        description: 'Notification service port',
        defaultValue: '3006',
    },
];

/**
 * Optional environment variables
 */
export const OPTIONAL_ENV_CONFIG: EnvVarConfig[] = [
    {
        name: 'PASSWORD_SALT_ROUNDS',
        severity: EnvVarSeverity.WARN,
        description: 'Bcrypt salt rounds for password hashing',
        defaultValue: '10',
        validator: (value) => !isNaN(Number(value)) && Number(value) >= 10 && Number(value) <= 15,
        validatorMessage: 'PASSWORD_SALT_ROUNDS should be between 10-15 for security',
    },
];

export interface ValidationResult {
    success: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates environment variables based on the provided configuration
 * @param configs - Array of environment variable configurations to validate
 * @param throwOnError - Whether to throw an error on required variable failure (default: true)
 * @returns ValidationResult with success status, errors, and warnings
 */
export function validateEnvironmentVariables(
    configs: EnvVarConfig[],
    throwOnError = true
): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    logger.log('🔍 Validating environment variables...\n');

    for (const config of configs) {
        const value = process.env[config.name];

        // Check if variable exists
        if (!value || value.trim() === '') {
            if (config.severity === EnvVarSeverity.REQUIRED) {
                const errorMsg = `❌ REQUIRED: ${config.name} is missing\n   Description: ${config.description}`;
                errors.push(errorMsg);
                logger.error(errorMsg);
            } else {
                const warningMsg = `⚠️  OPTIONAL: ${config.name} is missing${config.defaultValue ? ` (using default: ${config.defaultValue})` : ''}\n   Description: ${config.description}`;
                warnings.push(warningMsg);
                logger.warn(warningMsg);

                // Set default value if provided
                if (config.defaultValue) {
                    process.env[config.name] = config.defaultValue;
                }
            }
            continue;
        }

        // Run custom validator if provided
        if (config.validator && !config.validator(value)) {
            const validationMsg = config.validatorMessage || `Invalid value for ${config.name}`;

            if (config.severity === EnvVarSeverity.REQUIRED) {
                const errorMsg = `❌ INVALID: ${config.name}\n   ${validationMsg}`;
                errors.push(errorMsg);
                logger.error(errorMsg);
            } else {
                const warningMsg = `⚠️  INVALID: ${config.name}\n   ${validationMsg}`;
                warnings.push(warningMsg);
                logger.warn(warningMsg);
            }
            continue;
        }

        // Success - log only in debug mode
        logger.debug(`✅ ${config.name} - OK`);
    }

    // Summary
    logger.log('\n' + '='.repeat(60));
    if (errors.length === 0 && warnings.length === 0) {
        logger.log('✅ All environment variables validated successfully!');
    } else {
        if (errors.length > 0) {
            logger.error(`❌ Found ${errors.length} CRITICAL error(s)`);
        }
        if (warnings.length > 0) {
            logger.warn(`⚠️  Found ${warnings.length} warning(s)`);
        }
    }
    logger.log('='.repeat(60) + '\n');

    const success = errors.length === 0;

    // Throw error if required variables are missing and throwOnError is true
    if (!success && throwOnError) {
        throw new Error(
            `Environment validation failed!\n\n` +
            `Missing ${errors.length} required environment variable(s):\n` +
            errors.join('\n\n') +
            '\n\nPlease check your .env file and ensure all required variables are set.'
        );
    }

    return {
        success,
        errors,
        warnings,
    };
}

/**
 * Validate all environment variables (for main server)
 */
export function validateAllEnvVars(throwOnError = true): ValidationResult {
    const allConfigs = [
        ...BASE_ENV_CONFIG,
        ...AUTH_ENV_CONFIG,
        ...EMAIL_ENV_CONFIG,
        ...OAUTH_ENV_CONFIG,
        ...FRONTEND_ENV_CONFIG,
        ...TMDB_ENV_CONFIG,
        ...MICROSERVICE_ENV_CONFIG,
        ...OPTIONAL_ENV_CONFIG,
    ];

    return validateEnvironmentVariables(allConfigs, throwOnError);
}

/**
 * Generate .env.example file content
 */
export function generateEnvExample(configs: EnvVarConfig[]): string {
    let content = '# Trackd - Environment Variables Configuration\n';
    content += '# Copy this file to .env and fill in the values\n';
    content += '# Last updated: ' + new Date().toISOString().split('T')[0] + '\n\n';

    content += '#' + '='.repeat(58) + '\n';
    content += '# CRITICAL - REQUIRED VARIABLES\n';
    content += '#' + '='.repeat(58) + '\n\n';

    const requiredVars = configs.filter(c => c.severity === EnvVarSeverity.REQUIRED);
    requiredVars.forEach(config => {
        content += `# ${config.description}\n`;
        if (config.validatorMessage) {
            content += `# ${config.validatorMessage}\n`;
        }
        content += `${config.name}=\n\n`;
    });

    content += '\n#' + '='.repeat(58) + '\n';
    content += '# OPTIONAL - RECOMMENDED VARIABLES\n';
    content += '#' + '='.repeat(58) + '\n\n';

    const optionalVars = configs.filter(c => c.severity === EnvVarSeverity.WARN);
    optionalVars.forEach(config => {
        content += `# ${config.description}\n`;
        if (config.defaultValue) {
            content += `# Default: ${config.defaultValue}\n`;
        }
        if (config.validatorMessage) {
            content += `# ${config.validatorMessage}\n`;
        }
        content += `${config.name}=${config.defaultValue || ''}\n\n`;
    });

    return content;
}

