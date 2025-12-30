import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for business logic errors
 * Provides structured error responses with optional metadata
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly errorCode?: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(
      {
        message,
        errorCode,
        metadata,
      },
      statusCode,
    );
  }
}

/**
 * Predefined business exceptions for common scenarios
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`,
      HttpStatus.NOT_FOUND,
      'RESOURCE_NOT_FOUND',
      { resource, identifier },
    );
  }
}

export class ResourceAlreadyExistsException extends BusinessException {
  constructor(resource: string, field?: string, value?: string) {
    super(
      field && value
        ? `${resource} with ${field} '${value}' already exists`
        : `${resource} already exists`,
      HttpStatus.CONFLICT,
      'RESOURCE_ALREADY_EXISTS',
      { resource, field, value },
    );
  }
}

export class InvalidOperationException extends BusinessException {
  constructor(operation: string, reason: string) {
    super(
      `Cannot ${operation}: ${reason}`,
      HttpStatus.BAD_REQUEST,
      'INVALID_OPERATION',
      { operation, reason },
    );
  }
}

export class UnauthorizedOperationException extends BusinessException {
  constructor(operation: string, reason?: string) {
    super(
      reason
        ? `Unauthorized to ${operation}: ${reason}`
        : `Unauthorized to ${operation}`,
      HttpStatus.FORBIDDEN,
      'UNAUTHORIZED_OPERATION',
      { operation, reason },
    );
  }
}

