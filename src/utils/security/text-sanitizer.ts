/**
 * Text sanitizer to prevent XSS and injection attacks
 * Sanitizes user-provided text before rendering or storage
 */
export class TextSanitizer {
  private static readonly MAX_LENGTH = 1000;
  private static readonly DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<script/gi,
    /<\/script>/gi,
    /<iframe/gi,
    /<\/iframe>/gi,
    /<object/gi,
    /<\/object>/gi,
    /<embed/gi,
    /data:text\/html/gi
  ];

  /**
   * Sanitize text input to prevent XSS attacks
   * @param text - Raw text input from user
   * @returns Sanitized text safe for rendering
   */
  static sanitize(text: string): string {
    if (typeof text !== 'string') {
      return '';
    }

    let sanitized = text.trim();

    // Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove HTML tags (basic protection)
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove control characters except newlines and tabs
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Limit length to prevent DoS
    sanitized = sanitized.slice(0, this.MAX_LENGTH);

    return sanitized;
  }

  /**
   * Validate text length before processing
   */
  static isValidLength(text: string): boolean {
    return typeof text === 'string' && text.length <= this.MAX_LENGTH;
  }
}

