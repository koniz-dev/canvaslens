import { warn } from '../core/logger';

/**
 * URL validator for image sources
 * Ensures only safe protocols and formats are allowed
 */
export class UrlValidator {
  private static readonly ALLOWED_PROTOCOLS = ['http:', 'https:', 'data:'];
  private static readonly MAX_URL_LENGTH = 2048;
  private static readonly ALLOWED_DATA_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp'
  ];

  /**
   * Validate if URL is safe for image loading
   * @param url - URL string to validate
   * @returns true if URL is safe, false otherwise
   */
  static isValidImageUrl(url: string): boolean {
    if (typeof url !== 'string' || url.length === 0) {
      return false;
    }

    // Length check to prevent DoS
    if (url.length > this.MAX_URL_LENGTH) {
      warn('URL too long, maximum length is', this.MAX_URL_LENGTH);
      return false;
    }

    try {
      const parsed = new URL(url);

      // Protocol check - only allow safe protocols
      if (!this.ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
        warn('Unsafe protocol detected:', parsed.protocol);
        return false;
      }

      // Special validation for data URLs
      if (parsed.protocol === 'data:') {
        return this.isValidDataUrl(url);
      }

      // For http/https, validate hostname (basic check)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        // Allow any valid hostname (browser will handle CORS)
        return parsed.hostname.length > 0;
      }

      return true;
    } catch {
      // Invalid URL format
      return false;
    }
  }

  /**
   * Validate data URL format and MIME type
   */
  private static isValidDataUrl(url: string): boolean {
    // Data URL format: data:[<mediatype>][;base64],<data>
    const dataUrlMatch = url.match(/^data:([^;]+)(;base64)?,/);
    
    if (!dataUrlMatch || !dataUrlMatch[1]) {
      return false;
    }

    const mimeType = dataUrlMatch[1].trim().toLowerCase();

    // Only allow image MIME types
    if (!this.ALLOWED_DATA_MIME_TYPES.includes(mimeType)) {
      warn('Unsafe data URL MIME type:', mimeType);
      return false;
    }

    return true;
  }

  /**
   * Sanitize URL by removing dangerous characters
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') {
      return '';
    }

    // Remove control characters
    // eslint-disable-next-line no-control-regex
    let sanitized = url.replace(/[\x00-\x1F\x7F]/g, '');

    // Limit length
    sanitized = sanitized.slice(0, this.MAX_URL_LENGTH);

    return sanitized;
  }
}

