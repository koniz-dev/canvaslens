/**
 * Unit tests for AttributeParser
 */
import { AttributeParser } from '../components';
import { AnnotationToolsConfig } from '../modules';

describe('AttributeParser', () => {
  let mockElement: HTMLElement;
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockContainer = document.createElement('div');
  });

  describe('parseSize', () => {
    it('should parse pixel values', () => {
      expect(AttributeParser.parseSize('800px', 600)).toBe(800);
      expect(AttributeParser.parseSize('1200px', 600)).toBe(1200);
    });

    it('should parse percentage values', () => {
      expect(AttributeParser.parseSize('50%', 1000)).toBe(500);
      expect(AttributeParser.parseSize('75%', 800)).toBe(600);
    });

    it('should parse raw numbers', () => {
      expect(AttributeParser.parseSize('800', 600)).toBe(800);
      expect(AttributeParser.parseSize('1200', 600)).toBe(1200);
    });

    it('should return default value for null/undefined', () => {
      expect(AttributeParser.parseSize(null, 600)).toBe(600);
      expect(AttributeParser.parseSize(undefined as any, 600)).toBe(600);
    });

    it('should return default value for invalid input', () => {
      expect(AttributeParser.parseSize('invalid', 600)).toBe(600);
      expect(AttributeParser.parseSize('', 600)).toBe(600);
    });
  });

  describe('parseToolsConfig', () => {
    it('should parse valid JSON tools configuration', () => {
      const toolsJson = '{"zoom": true, "pan": false, "annotation": {"rect": true}}';
      mockElement.setAttribute('tools', toolsJson);
      
      const result = AnnotationToolsConfig.parseFromAttribute(mockElement);
      
      expect(result).toEqual({
        zoom: true,
        pan: false,
        annotation: { rect: true }
      });
    });

    it('should return default config for invalid JSON', () => {
      mockElement.setAttribute('tools', 'invalid json');
      
      const result = AnnotationToolsConfig.parseFromAttribute(mockElement);
      
      expect(result).toEqual({
        zoom: true,
        pan: true,
        annotation: {
          rect: true,
          arrow: true,
          text: true,
          circle: true,
          line: true
        },
        comparison: true
      });
    });

    it('should return default config when no tools attribute', () => {
      const result = AnnotationToolsConfig.parseFromAttribute(mockElement);
      
      expect(result).toEqual({
        zoom: true,
        pan: true,
        annotation: {
          rect: true,
          arrow: true,
          text: true,
          circle: true,
          line: true
        },
        comparison: true
      });
    });
  });

  describe('parseAttributes', () => {
    it('should parse all attributes correctly', () => {
      mockElement.setAttribute('width', '800px');
      mockElement.setAttribute('height', '600px');
      mockElement.setAttribute('background-color', '#ffffff');
      mockElement.setAttribute('max-zoom', '5');
      mockElement.setAttribute('min-zoom', '0.5');
      mockElement.setAttribute('tools', '{"zoom": true, "pan": false}');

      const result = AttributeParser.parseAttributes(mockElement, mockContainer);

      expect(result).toEqual({
        container: mockContainer,
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        maxZoom: 5,
        minZoom: 0.5,
        tools: {
          zoom: true,
          pan: false
        }
      });
    });

    it('should use default values when attributes are missing', () => {
      const result = AttributeParser.parseAttributes(mockElement, mockContainer);

      expect(result).toEqual({
        container: mockContainer,
        width: 800,
        height: 600,
        backgroundColor: '#f0f0f0',
        maxZoom: 10,
        minZoom: 0.1,
        tools: {
          zoom: true,
          pan: true,
          annotation: {
            rect: true,
            arrow: true,
            text: true,
            circle: true,
            line: true
          },
          comparison: true
        }
      });
    });
  });

  describe('getContainerDimensions', () => {
    it('should return actual container dimensions', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 1000 });
      Object.defineProperty(mockElement, 'clientHeight', { value: 800 });
      mockElement.setAttribute('width', '90%');
      mockElement.setAttribute('height', '80%');

      const result = AttributeParser.getContainerDimensions(mockElement);

      expect(result).toEqual({
        width: 900, // 90% of 1000
        height: 640  // 80% of 800
      });
    });

    it('should fallback to offset dimensions', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 0 });
      Object.defineProperty(mockElement, 'clientHeight', { value: 0 });
      Object.defineProperty(mockElement, 'offsetWidth', { value: 1200 });
      Object.defineProperty(mockElement, 'offsetHeight', { value: 900 });

      const result = AttributeParser.getContainerDimensions(mockElement);

      expect(result).toEqual({
        width: 1200,
        height: 900
      });
    });

    it('should use default dimensions when no dimensions available', () => {
      Object.defineProperty(mockElement, 'clientWidth', { value: 0 });
      Object.defineProperty(mockElement, 'clientHeight', { value: 0 });
      Object.defineProperty(mockElement, 'offsetWidth', { value: 0 });
      Object.defineProperty(mockElement, 'offsetHeight', { value: 0 });

      const result = AttributeParser.getContainerDimensions(mockElement);

      expect(result).toEqual({
        width: 800,
        height: 600
      });
    });
  });
});
