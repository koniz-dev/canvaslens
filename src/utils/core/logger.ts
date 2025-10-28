
/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__DEV__ === true;
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
function formatMessage(level: string, ...args: unknown[]): unknown[] {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level}]`;
  return [prefix, ...args];
}

export function log(...args: unknown[]): void {
  if (isDevelopment()) {
    console.log(...formatMessage('DEBUG', ...args));
  }
}

export function warn(...args: unknown[]): void {
  if (isDevelopment()) {
    console.warn(...formatMessage('WARN', ...args));
  }
}

export function error(...args: unknown[]): void {
  console.error(...formatMessage('ERROR', ...args));
}

export function info(...args: unknown[]): void {
  console.info(...formatMessage('INFO', ...args));
}