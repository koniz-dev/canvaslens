import { SecureJsonParser } from '../../../utils/security/secure-json-parser';
import { TextSanitizer } from '../../../utils/security/text-sanitizer';
import { UrlValidator } from '../../../utils/security/url-validator';
import { ValidationHelper } from '../../../utils/core/validation-helper';

describe('Security Utilities', () => {
  describe('SecureJsonParser', () => {
    describe('parseToolConfig', () => {
      it('should parse valid tool config', () => {
        const validConfig = '{"zoom": true, "pan": false}';
        const result = SecureJsonParser.parseToolConfig(validConfig);
        expect(result).toEqual({ zoom: true, pan: false });
      });

      it('should reject invalid JSON', () => {
        const invalidJson = '{zoom: true}'; // Missing quotes
        const result = SecureJsonParser.parseToolConfig(invalidJson);
        expect(result).toBeNull();
      });

      it('should reject JSON that is too large', () => {
        const largeJson = JSON.stringify({ data: 'x'.repeat(15000) });
        const result = SecureJsonParser.parseToolConfig(largeJson);
        expect(result).toBeNull();
      });

      it('should reject deeply nested objects', () => {
        let deepObject: Record<string, unknown> = { value: 'test' };
        for (let i = 0; i < 35; i++) {
          deepObject = { nested: deepObject };
        }
        const deepJson = JSON.stringify(deepObject);
        const result = SecureJsonParser.parseToolConfig(deepJson);
        expect(result).toBeNull();
      });

      it('should accept tool config with extra properties (permissive validation)', () => {
        // ValidationHelper.isValidToolConfig is permissive and accepts extra properties
        // This is by design to allow future extensions
        const configWithExtra = '{"zoom": true, "invalid": "structure"}';
        const result = SecureJsonParser.parseToolConfig(configWithExtra);
        // Should still parse successfully as the structure is valid
        expect(result).not.toBeNull();
        expect(result?.zoom).toBe(true);
      });
    });

    describe('parseAnnotations', () => {
      it('should parse valid annotation array', () => {
        const validAnnotations = '[{"id": "1", "type": "rect", "points": [{"x": 0, "y": 0}]}]';
        const result = SecureJsonParser.parseAnnotations(validAnnotations);
        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(1);
      });

      it('should reject non-array JSON', () => {
        const nonArray = '{"not": "an array"}';
        const result = SecureJsonParser.parseAnnotations(nonArray);
        expect(result).toBeNull();
      });
    });

    describe('parse with custom validator', () => {
      it('should use provided validator', () => {
        const validData = '{"test": "value"}';
        const validator = (data: unknown): data is { test: string } => {
          return typeof data === 'object' && data !== null && 'test' in data;
        };
        const result = SecureJsonParser.parse(validData, validator);
        expect(result).toEqual({ test: 'value' });
      });

      it('should reject data that fails validator', () => {
        const invalidData = '{"wrong": "value"}';
        const validator = (data: unknown): data is { test: string } => {
          return typeof data === 'object' && data !== null && 'test' in data;
        };
        const result = SecureJsonParser.parse(invalidData, validator);
        expect(result).toBeNull();
      });
    });
  });

  describe('TextSanitizer', () => {
    describe('sanitize', () => {
      it('should remove javascript: protocol', () => {
        const malicious = 'Click javascript:alert("XSS")';
        const sanitized = TextSanitizer.sanitize(malicious);
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).toContain('Click');
      });

      it('should remove event handlers', () => {
        const malicious = 'Text onclick=alert("XSS")';
        const sanitized = TextSanitizer.sanitize(malicious);
        expect(sanitized).not.toContain('onclick=');
        expect(sanitized).toContain('Text');
      });

      it('should remove script tags', () => {
        const malicious = 'Text <script>alert("XSS")</script> more text';
        const sanitized = TextSanitizer.sanitize(malicious);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('</script>');
        expect(sanitized).toContain('Text');
        expect(sanitized).toContain('more text');
      });

      it('should remove HTML tags', () => {
        const withHtml = 'Text <b>bold</b> and <i>italic</i>';
        const sanitized = TextSanitizer.sanitize(withHtml);
        expect(sanitized).not.toContain('<b>');
        expect(sanitized).not.toContain('</b>');
        expect(sanitized).toContain('Text');
        expect(sanitized).toContain('bold');
      });

      it('should remove control characters', () => {
        const withControl = 'Text\x00\x08\x0B\x0C\x0E\x1F\x7Fmore';
        const sanitized = TextSanitizer.sanitize(withControl);
        expect(sanitized).not.toContain('\x00');
        expect(sanitized).toContain('Text');
        expect(sanitized).toContain('more');
      });

      it('should limit text length', () => {
        const longText = 'x'.repeat(2000);
        const sanitized = TextSanitizer.sanitize(longText);
        expect(sanitized.length).toBeLessThanOrEqual(1000);
      });

      it('should handle empty string', () => {
        const sanitized = TextSanitizer.sanitize('');
        expect(sanitized).toBe('');
      });

      it('should handle non-string input', () => {
        const sanitized = TextSanitizer.sanitize(null as unknown as string);
        expect(sanitized).toBe('');
      });
    });

    describe('isValidLength', () => {
      it('should return true for valid length', () => {
        expect(TextSanitizer.isValidLength('short text')).toBe(true);
      });

      it('should return false for too long text', () => {
        const longText = 'x'.repeat(2000);
        expect(TextSanitizer.isValidLength(longText)).toBe(false);
      });

      it('should return false for non-string', () => {
        expect(TextSanitizer.isValidLength(null as unknown as string)).toBe(false);
      });
    });
  });

  describe('UrlValidator', () => {
    describe('isValidImageUrl', () => {
      it('should accept http URLs', () => {
        expect(UrlValidator.isValidImageUrl('http://example.com/image.jpg')).toBe(true);
      });

      it('should accept https URLs', () => {
        expect(UrlValidator.isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      });

      it('should accept valid data URLs', () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        expect(UrlValidator.isValidImageUrl(dataUrl)).toBe(true);
      });

      it('should reject javascript: protocol', () => {
        expect(UrlValidator.isValidImageUrl('javascript:alert("XSS")')).toBe(false);
      });

      it('should reject file: protocol', () => {
        expect(UrlValidator.isValidImageUrl('file:///path/to/image.jpg')).toBe(false);
      });

      it('should reject invalid data URL MIME type', () => {
        const invalidDataUrl = 'data:text/html,<script>alert("XSS")</script>';
        expect(UrlValidator.isValidImageUrl(invalidDataUrl)).toBe(false);
      });

      it('should reject URLs that are too long', () => {
        const longUrl = 'https://example.com/' + 'x'.repeat(3000);
        expect(UrlValidator.isValidImageUrl(longUrl)).toBe(false);
      });

      it('should reject invalid URL format', () => {
        expect(UrlValidator.isValidImageUrl('not a url')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(UrlValidator.isValidImageUrl('')).toBe(false);
      });

      it('should reject non-string input', () => {
        expect(UrlValidator.isValidImageUrl(null as unknown as string)).toBe(false);
      });

      it('should accept various image MIME types in data URLs', () => {
        const mimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        mimeTypes.forEach(mimeType => {
          const dataUrl = `data:${mimeType};base64,test`;
          expect(UrlValidator.isValidImageUrl(dataUrl)).toBe(true);
        });
      });
    });

    describe('sanitizeUrl', () => {
      it('should remove control characters', () => {
        const urlWithControl = 'https://example.com/image\x00\x1F.jpg';
        const sanitized = UrlValidator.sanitizeUrl(urlWithControl);
        expect(sanitized).not.toContain('\x00');
        expect(sanitized).not.toContain('\x1F');
        expect(sanitized).toContain('https://example.com/image.jpg');
      });

      it('should limit URL length', () => {
        const longUrl = 'https://example.com/' + 'x'.repeat(3000);
        const sanitized = UrlValidator.sanitizeUrl(longUrl);
        expect(sanitized.length).toBeLessThanOrEqual(2048);
      });

      it('should handle empty string', () => {
        expect(UrlValidator.sanitizeUrl('')).toBe('');
      });

      it('should handle non-string input', () => {
        expect(UrlValidator.sanitizeUrl(null as unknown as string)).toBe('');
      });
    });
  });

  describe('Integration with ValidationHelper', () => {
    it('should use UrlValidator for isValidImageUrl', () => {
      expect(ValidationHelper.isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(ValidationHelper.isValidImageUrl('javascript:alert("XSS")')).toBe(false);
    });
  });
});

