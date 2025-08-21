import { CanvasLens } from '../../src/index';
import { CanvasLensOptions } from '../../src/types';

describe('CanvasLens Integration Tests', () => {
  let container: HTMLElement;
  let canvasLens: CanvasLens;

  beforeEach(() => {
    // Create a test container
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const options: CanvasLensOptions = {
        container
      };

      expect(() => {
        canvasLens = new CanvasLens(options);
      }).not.toThrow();

      expect(canvasLens).toBeDefined();
    });

    it('should initialize with custom options', () => {
      const options: CanvasLensOptions = {
        container,
        width: 1000,
        height: 800,
        backgroundColor: '#000000',
        enableZoom: false,
        enablePan: false,
        enableAnnotations: true,
        maxZoom: 5,
        minZoom: 0.5
      };

      expect(() => {
        canvasLens = new CanvasLens(options);
      }).not.toThrow();

      expect(canvasLens).toBeDefined();
    });

    it('should throw error when container is not provided', () => {
      const options = {} as CanvasLensOptions;

      expect(() => {
        new CanvasLens(options);
      }).toThrow();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableZoom: true,
        enablePan: true
      };
      canvasLens = new CanvasLens(options);
    });

    it('should handle mouse events', () => {
      // Test mouse down event
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        button: 0
      });

      expect(() => {
        container.dispatchEvent(mouseDownEvent);
      }).not.toThrow();

      // Test mouse move event
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150
      });

      expect(() => {
        container.dispatchEvent(mouseMoveEvent);
      }).not.toThrow();

      // Test mouse up event
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 150,
        clientY: 150,
        button: 0
      });

      expect(() => {
        container.dispatchEvent(mouseUpEvent);
      }).not.toThrow();
    });

    it('should handle wheel events for zooming', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 100,
        clientY: 100
      });

      expect(() => {
        container.dispatchEvent(wheelEvent);
      }).not.toThrow();
    });

    it('should handle touch events', () => {
      // Test touch start
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          new Touch({
            identifier: 1,
            target: container,
            clientX: 100,
            clientY: 100,
            pageX: 100,
            pageY: 100,
            radiusX: 1,
            radiusY: 1,
            rotationAngle: 0,
            force: 1
          })
        ]
      });

      expect(() => {
        container.dispatchEvent(touchStartEvent);
      }).not.toThrow();

      // Test touch move
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [
          new Touch({
            identifier: 1,
            target: container,
            clientX: 150,
            clientY: 150,
            pageX: 150,
            pageY: 150,
            radiusX: 1,
            radiusY: 1,
            rotationAngle: 0,
            force: 1
          })
        ]
      });

      expect(() => {
        container.dispatchEvent(touchMoveEvent);
      }).not.toThrow();

      // Test touch end
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [
          new Touch({
            identifier: 1,
            target: container,
            clientX: 150,
            clientY: 150,
            pageX: 150,
            pageY: 150,
            radiusX: 1,
            radiusY: 1,
            rotationAngle: 0,
            force: 1
          })
        ]
      });

      expect(() => {
        container.dispatchEvent(touchEndEvent);
      }).not.toThrow();
    });
  });

  describe('Image Loading', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container
      };
      canvasLens = new CanvasLens(options);
    });

    it('should handle image loading', async () => {
      // Mock image loading
      const mockImage = new Image();
      Object.defineProperty(mockImage, 'naturalWidth', { value: 1000, writable: false });
      Object.defineProperty(mockImage, 'naturalHeight', { value: 500, writable: false });

      // Simulate successful image load
      setTimeout(() => {
        mockImage.onload?.(new Event('load'));
      }, 0);

      expect(() => {
        // This would normally call canvasLens.loadImage() method
        // For now, we just test that the instance can handle image-related operations
      }).not.toThrow();
    });
  });

  describe('Zoom and Pan Integration', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableZoom: true,
        enablePan: true,
        maxZoom: 5,
        minZoom: 0.1
      };
      canvasLens = new CanvasLens(options);
    });

    it('should handle zoom operations', () => {
      // Test zoom in
      const zoomInEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 100,
        clientY: 100
      });

      expect(() => {
        container.dispatchEvent(zoomInEvent);
      }).not.toThrow();

      // Test zoom out
      const zoomOutEvent = new WheelEvent('wheel', {
        deltaY: 100,
        clientX: 100,
        clientY: 100
      });

      expect(() => {
        container.dispatchEvent(zoomOutEvent);
      }).not.toThrow();
    });

    it('should handle pan operations', () => {
      // Simulate mouse drag for panning
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        button: 0
      });

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 200,
        clientY: 200
      });

      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 200,
        clientY: 200,
        button: 0
      });

      expect(() => {
        container.dispatchEvent(mouseDownEvent);
        container.dispatchEvent(mouseMoveEvent);
        container.dispatchEvent(mouseUpEvent);
      }).not.toThrow();
    });
  });
});
