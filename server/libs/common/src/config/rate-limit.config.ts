/**
 * Rate Limiting Configuration
 *
 * This configuration provides different rate limiting strategies for different types of endpoints:
 * - STRICT: For sensitive operations (auth, OTP)
 * - MODERATE: For write operations (create, update, delete)
 * - RELAXED: For read operations (get, list)
 * - CUSTOM: For specific endpoints requiring unique limits
 */

export const RateLimitConfig = {
  /**
   * Global default rate limit (applies to all endpoints without specific limits)
   * 100 requests per minute per IP
   */
  GLOBAL: {
    ttl: 60000, // 1 minute
    limit: 100,
  },

  /**
   * Strict rate limiting for authentication and sensitive operations
   * 5-10 requests per minute
   */
  STRICT: {
    AUTH_LOGIN: {
      ttl: 60000, // 1 minute
      limit: 10,
      blockDuration: 300000, // 5 minutes block after limit exceeded
    },
    AUTH_REGISTER: {
      ttl: 60000,
      limit: 5,
      blockDuration: 300000,
    },
    SEND_OTP: {
      ttl: 60000,
      limit: 3, // Very strict - only 3 OTP requests per minute
      blockDuration: 600000, // 10 minutes block
    },
    VERIFY_OTP: {
      ttl: 60000,
      limit: 10,
    },
    PASSWORD_RESET_REQUEST: {
      ttl: 60000,
      limit: 3,
      blockDuration: 600000, // 10 minutes block
    },
    PASSWORD_RESET_CONFIRM: {
      ttl: 60000,
      limit: 5,
    },
    EMAIL_CHANGE_REQUEST: {
      ttl: 60000,
      limit: 5,
    },
  },

  /**
   * Moderate rate limiting for write operations
   * 20-30 requests per minute
   */
  MODERATE: {
    FOLLOW_UNFOLLOW: {
      ttl: 60000,
      limit: 20,
    },
    FRIEND_REQUEST: {
      ttl: 60000,
      limit: 15,
    },
    UPDATE_PROFILE: {
      ttl: 60000,
      limit: 10,
    },
    ADD_REMOVE_MOVIE: {
      ttl: 60000,
      limit: 30,
    },
    RATE_MOVIE: {
      ttl: 60000,
      limit: 30,
    },
  },

  /**
   * Relaxed rate limiting for read operations
   * 60-100 requests per minute
   */
  RELAXED: {
    GET_USER: {
      ttl: 60000,
      limit: 60,
    },
    GET_MOVIES: {
      ttl: 60000,
      limit: 60,
    },
    SEARCH: {
      ttl: 60000,
      limit: 40, // Search can be expensive
    },
    GET_FRIENDS: {
      ttl: 60000,
      limit: 60,
    },
    GET_NOTIFICATIONS: {
      ttl: 60000,
      limit: 60,
    },
  },

  /**
   * Special rate limits for specific scenarios
   */
  CUSTOM: {
    // Refresh token can be called frequently
    REFRESH_TOKEN: {
      ttl: 60000,
      limit: 20,
    },
    // Health check endpoints (very relaxed)
    HEALTH_CHECK: {
      ttl: 60000,
      limit: 100,
    },
  },
} as const;


/**
 * Rate limit error messages
 */
export const RateLimitMessages = {
  EXCEEDED: 'Too many requests. Please try again later.',
  BLOCKED: 'Too many failed attempts. Your IP has been temporarily blocked.',
} as const;

