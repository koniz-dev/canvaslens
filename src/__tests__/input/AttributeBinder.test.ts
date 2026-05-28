import { AttributeBinder } from '../../input/AttributeBinder';

describe('AttributeBinder', () => {
  let element: HTMLElement;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    element = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('parseSize', () => {
    it('should return default size when size is null', () => {
      const result = AttributeBinder.parseSize(null, 800);
      expect(result).toBe(800);
    });

    it('should parse size with px suffix', () => {
      const result = AttributeBinder.parseSize('1000px', 800);
      expect(result).toBe(1000);
    });

    it('should parse size with percentage', () => {
      const result = AttributeBinder.parseSize('50%', 800);
      expect(result).toBe(400);
    });

    it('should parse raw number', () => {
      const result = AttributeBinder.parseSize('1200', 800);
      expect(result).toBe(1200);
    });

    it('should return default for invalid percentage (>100)', () => {
      const result = AttributeBinder.parseSize('150%', 800);
      expect(result).toBe(800);
    });

    it('should return default for invalid percentage (<0)', () => {
      const result = AttributeBinder.parseSize('-10%', 800);
      expect(result).toBe(800);
    });

    it('should return default for NaN values', () => {
      const result = AttributeBinder.parseSize('invalid', 800);
      expect(result).toBe(800);
    });

    it('should return default for negative values', () => {
      const result = AttributeBinder.parseSize('-100', 800);
      expect(result).toBe(800);
    });

    it('should return default for values exceeding MAX_SIZE', () => {
      const result = AttributeBinder.parseSize('200000', 800);
      expect(result).toBe(800);
    });
  });

  describe('getContainerDimensions', () => {
    it('should get dimensions from attributes', () => {
      element.setAttribute('width', '1000px');
      element.setAttribute('height', '800px');
      Object.defineProperty(element, 'clientWidth', { value: 800, writable: true, configurable: true });
      Object.defineProperty(element, 'clientHeight', { value: 600, writable: true, configurable: true });
      
      const result = AttributeBinder.dimensions(element);
      expect(result.width).toBe(1000);
      expect(result.height).toBe(800);
    });

    it('should fallback to client dimensions when attributes not set', () => {
      Object.defineProperty(element, 'clientWidth', { value: 1200, writable: true, configurable: true });
      Object.defineProperty(element, 'clientHeight', { value: 900, writable: true, configurable: true });
      
      const result = AttributeBinder.dimensions(element);
      expect(result.width).toBe(1200);
      expect(result.height).toBe(900);
    });

    it('should fallback to offset dimensions when client dimensions not available', () => {
      Object.defineProperty(element, 'clientWidth', { value: 0, writable: true, configurable: true });
      Object.defineProperty(element, 'clientHeight', { value: 0, writable: true, configurable: true });
      Object.defineProperty(element, 'offsetWidth', { value: 1000, writable: true, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 750, writable: true, configurable: true });
      
      const result = AttributeBinder.dimensions(element);
      expect(result.width).toBe(1000);
      expect(result.height).toBe(750);
    });

    it('should use default dimensions when no dimensions available', () => {
      Object.defineProperty(element, 'clientWidth', { value: 0, writable: true, configurable: true });
      Object.defineProperty(element, 'clientHeight', { value: 0, writable: true, configurable: true });
      Object.defineProperty(element, 'offsetWidth', { value: 0, writable: true, configurable: true });
      Object.defineProperty(element, 'offsetHeight', { value: 0, writable: true, configurable: true });
      
      const result = AttributeBinder.dimensions(element);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });
  });

  describe('parseAttributes', () => {
    it('should parse basic attributes', () => {
      element.setAttribute('width', '1000px');
      element.setAttribute('height', '800px');
      element.setAttribute('background-color', '#ffffff');
      element.setAttribute('max-zoom', '5');
      element.setAttribute('min-zoom', '0.5');
      
      const result = AttributeBinder.read(element, container);
      expect(result.width).toBe(1000);
      expect(result.height).toBe(800);
      expect(result.backgroundColor).toBe('#ffffff');
      expect(result.maxZoom).toBe(5);
      expect(result.minZoom).toBe(0.5);
    });

    it('should use default values when attributes not set', () => {
      const result = AttributeBinder.read(element, container);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.backgroundColor).toBe('#f0f0f0');
      expect(result.maxZoom).toBe(10);
      expect(result.minZoom).toBe(0.1);
    });

    it('should parse tools configuration', () => {
      element.setAttribute('tools', JSON.stringify({ zoom: true, pan: true }));
      
      const result = AttributeBinder.read(element, container);
      expect(result.tools).toBeDefined();
    });

    it('should handle invalid tools configuration gracefully', () => {
      element.setAttribute('tools', 'invalid json');
      
      const result = AttributeBinder.read(element, container);
      expect(result).toBeDefined();
    });
  });
});

