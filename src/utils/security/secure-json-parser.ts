import type { ToolConfig } from '../../types';
import { warn } from '../core/logger';
import { ValidationHelper } from '../core/validation-helper';

/**
 * Secure JSON parser with validation and size limits
 * Prevents prototype pollution, DoS attacks, and type confusion
 */
export class SecureJsonParser {
  /** 1 MB — comfortably fits 1000+ annotations pretty-printed. The cap is
   *  here to short-circuit DoS, not to constrain legitimate use. */
  private static readonly MAX_JSON_SIZE = 1_000_000;
  private static readonly MAX_DEPTH = 32;

  /**
   * Parse JSON with validation and size limits
   * @param json - JSON string to parse
   * @param validator - Type guard function to validate parsed data
   * @returns Parsed and validated data, or null if invalid
   */
  static parse<T>(
    json: string,
    validator: (data: unknown) => data is T
  ): T | null {
    // Size check to prevent DoS
    if (json.length > this.MAX_JSON_SIZE) {
      warn('JSON input too large, maximum size is', this.MAX_JSON_SIZE);
      return null;
    }

    try {
      const parsed = JSON.parse(json);

      // Check depth to prevent deeply nested object attacks
      if (this.getDepth(parsed) > this.MAX_DEPTH) {
        warn('JSON structure too deeply nested');
        return null;
      }

      // Validate structure using provided validator
      if (!validator(parsed)) {
        warn('JSON validation failed');
        return null;
      }

      return parsed;
    } catch (error) {
      warn('JSON parse error:', error);
      return null;
    }
  }

  /**
   * Parse tool configuration with validation
   */
  static parseToolConfig(json: string): ToolConfig | null {
    return this.parse(json, ValidationHelper.isValidToolConfig);
  }

  /**
   * Parse annotation array with validation
   */
  static parseAnnotations(json: string): unknown[] | null {
    return this.parse(json, (data): data is unknown[] => {
      return Array.isArray(data);
    });
  }

  /**
   * Calculate maximum depth of an object/array
   */
  private static getDepth(obj: unknown, currentDepth = 0): number {
    if (currentDepth > this.MAX_DEPTH) {
      return currentDepth;
    }

    if (obj === null || typeof obj !== 'object') {
      return currentDepth;
    }

    if (Array.isArray(obj)) {
      let maxDepth = currentDepth;
      for (const item of obj) {
        const depth = this.getDepth(item, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
      return maxDepth;
    }

    let maxDepth = currentDepth;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const depth = this.getDepth((obj as Record<string, unknown>)[key], currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }
    return maxDepth;
  }
}

