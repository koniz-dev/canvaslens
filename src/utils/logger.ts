/**
 * Logger utility for production-safe logging
 */

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         typeof window !== 'undefined' && (window as any).__DEV__ === true;
}

/**
 * Production-safe console.log
 */
export function log(...args: any[]): void {
  if (isDevelopment()) {
    console.log(...args);
  }
}

/**
 * Production-safe console.warn
 */
export function warn(...args: any[]): void {
  if (isDevelopment()) {
    console.warn(...args);
  }
}

/**
 * Console.error - always logged (important for debugging)
 */
export function error(...args: any[]): void {
  console.error(...args);
}

/**
 * Console.info - always logged (important information)
 */
export function info(...args: any[]): void {
  console.info(...args);
}
