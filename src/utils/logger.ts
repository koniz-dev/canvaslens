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
 * Get formatted timestamp
 */
function getTimestamp(): string {
  const now = new Date();
  const timeString = now.toLocaleTimeString('vi-VN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  return `${timeString}.${milliseconds}`;
}

/**
 * Format log message with timestamp and prefix
 */
function formatMessage(level: string, ...args: any[]): any[] {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level}]`;
  return [prefix, ...args];
}

/**
 * Production-safe console.log
 */
export function log(...args: any[]): void {
  if (isDevelopment()) {
    console.log(...formatMessage('DEBUG', ...args));
  }
}

/**
 * Production-safe console.warn
 */
export function warn(...args: any[]): void {
  if (isDevelopment()) {
    console.warn(...formatMessage('WARN', ...args));
  }
}

/**
 * Console.error - always logged (important for debugging)
 */
export function error(...args: any[]): void {
  console.error(...formatMessage('ERROR', ...args));
}

/**
 * Console.info - always logged (important information)
 */
export function info(...args: any[]): void {
  console.info(...formatMessage('INFO', ...args));
}