/**
 * Logging utility that only logs in development mode
 * Prevents console pollution in production builds
 */

const isDevelopment = import.meta.env.DEV;

const logger = {

  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log("LOG ", ...args);
    }
  },

  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error("LOG ", ...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn("LOG ", ...args);
    }
  },

  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug("LOG ", ...args);
    }
  },

  table: (data: unknown): void => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

export default logger;

