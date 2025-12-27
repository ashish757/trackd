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

export const ENV_CONFIG: EnvVarConfig[] = [
    // ==================== CRITICAL - REQUIRED ====================
    {
        name: 'DATABASE_URL',
        severity: EnvVarSeverity.REQUIRED,
        description: 'PostgreSQL database connection string',
    },
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
    {
        name: 'RESEND_API_KEY',
        severity: EnvVarSeverity.WARN,
        description: 'Resend email service API key',
        validator: (value) => value.startsWith('re_'),
        validatorMessage: 'RESEND_API_KEY must be a valid Resend API key (starts with re_)',
    },
    {
        name: 'TMDB_ACCESS_TOKEN',
        severity: EnvVarSeverity.REQUIRED,
        description: 'TMDB API access token (Bearer token)',
    },

    // ==================== GOOGLE OAUTH (REQUIRED IF OAUTH ENABLED) ====================
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

    // ==================== FRONTEND URLS (REQUIRED) ====================
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

    // ==================== ENVIRONMENT TYPE (REQUIRED) ====================
    {
        name: 'ENV',
        severity: EnvVarSeverity.REQUIRED,
        description: 'Environment type (production/development)',
        validator: (value) => ['production', 'development'].includes(value),
        validatorMessage: 'ENV must be either "production" or "development"',
    },

    // ==================== OPTIONAL - WARNING LEVEL ====================
    {
        name: 'PORT',
        severity: EnvVarSeverity.WARN,
        description: 'Server port number',
        defaultValue: '3000',
        validator: (value) => !isNaN(Number(value)) && Number(value) > 0 && Number(value) < 65536,
        validatorMessage: 'PORT must be a valid port number (1-65535)',
    },
    {
        name: 'TMDB_API_KEY',
        severity: EnvVarSeverity.WARN,
        description: 'TMDB API key (v3 API - legacy, use ACCESS_TOKEN instead)',
    },
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
 * Validates all environment variables based on the configuration
 * @param throwOnError - Whether to throw an error on required variable failure (default: true)
 * @returns ValidationResult with success status, errors, and warnings
 */
export function validateEnvironmentVariables(throwOnError = true): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    logger.log('🔍 Validating environment variables...\n');

    for (const config of ENV_CONFIG) {
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
 * Prints environment configuration guide
 */
export function printEnvGuide(): void {
    logger.log('\n' + '='.repeat(60));
    logger.log('📚 ENVIRONMENT VARIABLES GUIDE');
    logger.log('='.repeat(60) + '\n');

    const requiredVars = ENV_CONFIG.filter(c => c.severity === EnvVarSeverity.REQUIRED);
    const optionalVars = ENV_CONFIG.filter(c => c.severity === EnvVarSeverity.WARN);

    logger.log('🔴 REQUIRED VARIABLES:\n');
    requiredVars.forEach((config, index) => {
        logger.log(`${index + 1}. ${config.name}`);
        logger.log(`   ${config.description}`);
        if (config.validatorMessage) {
            logger.log(`   Validation: ${config.validatorMessage}`);
        }
        logger.log('');
    });

    logger.log('\n🟡 OPTIONAL VARIABLES (with defaults):\n');
    optionalVars.forEach((config, index) => {
        logger.log(`${index + 1}. ${config.name}${config.defaultValue ? ` (default: ${config.defaultValue})` : ''}`);
        logger.log(`   ${config.description}`);
        if (config.validatorMessage) {
            logger.log(`   Validation: ${config.validatorMessage}`);
        }
        logger.log('');
    });

    logger.log('='.repeat(60) + '\n');
}

/**
 * Generate .env.example file content
 */
export function generateEnvExample(): string {
    let content = '# Trackd - Environment Variables Configuration\n';
    content += '# Copy this file to .env and fill in the values\n';
    content += '# Last updated: ' + new Date().toISOString().split('T')[0] + '\n\n';

    content += '#' + '='.repeat(58) + '\n';
    content += '# CRITICAL - REQUIRED VARIABLES\n';
    content += '#' + '='.repeat(58) + '\n\n';

    const requiredVars = ENV_CONFIG.filter(c => c.severity === EnvVarSeverity.REQUIRED);
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

    const optionalVars = ENV_CONFIG.filter(c => c.severity === EnvVarSeverity.WARN);
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

