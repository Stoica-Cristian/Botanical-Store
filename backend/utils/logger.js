/**
 * Simple logging utility for the application
 * Uses console.log with formatted output
 */

export const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`);
  },

  error: (message) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`);
  },

  warn: (message) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`);
  },

  debug: (message) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      console.debug(`[DEBUG] ${timestamp} - ${message}`);
    }
  },
};
