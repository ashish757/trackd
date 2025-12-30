import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { CustomLoggerService } from '../logger/custom-logger.service';

/**
 * Wraps async operations with try-catch and provides consistent error handling
 * @param operation The async operation to execute
 * @param context Context information for logging (e.g., service name, method name)
 * @param fallbackMessage Optional fallback error message
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context: { service: string; method: string },
  fallbackMessage?: string,
): Promise<T> {
  const logger = new CustomLoggerService();
  logger.setContext(`${context.service}.${context.method}`);

  try {
    return await operation();
  } catch (error) {
    // If it's already an HttpException, rethrow it
    if (error instanceof HttpException) {
      throw error;
    }

    // Log unexpected errors
    logger.error(
      `Unexpected error in ${context.service}.${context.method}`,
      error instanceof Error ? error.stack : '',
      { error: error instanceof Error ? error.message : String(error) },
    );

    // Throw internal server error for unexpected errors
    throw new InternalServerErrorException(
      fallbackMessage || 'An unexpected error occurred',
    );
  }
}

/**
 * Validates that a value is not null/undefined and throws NotFoundException if it is
 * @param value The value to check
 * @param resourceName Name of the resource for error message
 * @param identifier Optional identifier for the resource
 */
export function assertExists<T>(
  value: T | null | undefined,
  resourceName: string,
  identifier?: string,
): asserts value is T {
  if (value === null || value === undefined) {
    const message = identifier
      ? `${resourceName} with identifier '${identifier}' not found`
      : `${resourceName} not found`;
    throw new HttpException(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Validates a condition and throws BadRequestException if false
 * @param condition The condition to check
 * @param message Error message if condition is false
 */
export function assertValid(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Safely executes a database operation and handles Prisma-specific errors
 */
export async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  context: { service: string; method: string },
): Promise<T> {
  return handleAsyncOperation(operation, context, 'Database operation failed');
}

