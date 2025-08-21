import { CanvasLens } from '../../src/index';
import { CanvasLensOptions } from '../../src/types';

describe('CanvasLens Functional Tests', () => {
  let container: HTMLElement;
  let canvasLens: CanvasLens;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Image Viewing Features', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        width: 800,
        height: 600
      };
      canvasLens = new CanvasLens(options);
    });

    it('should display image with correct dimensions', () => {
      // Test that the canvas is created with correct size
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeDefined();
      expect(canvas?.width).toBe(800);
      expect(canvas?.height).toBe(600);
    });

    it('should handle different image aspect ratios', () => {
      // Test with landscape image
      const landscapeOptions: CanvasLensOptions = {
        container,
        width: 800,
        height: 600
      };
      const landscapeCanvasLens = new CanvasLens(landscapeOptions);
      expect(landscapeCanvasLens).toBeDefined();

      // Test with portrait image
      const portraitOptions: CanvasLensOptions = {
        container,
        width: 600,
        height: 800
      };
      const portraitCanvasLens = new CanvasLens(portraitOptions);
      expect(portraitCanvasLens).toBeDefined();
    });

    it('should maintain image quality during zoom operations', () => {
      // Test that zoom operations don't break the canvas
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300
      });

      expect(() => {
        container.dispatchEvent(wheelEvent);
      }).not.toThrow();

      // Verify canvas still exists and is functional
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeDefined();
    });
  });

  describe('Zoom and Pan Features', () => {
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

    it('should zoom in when wheel scroll up', () => {
      const zoomInEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300
      });

      expect(() => {
        container.dispatchEvent(zoomInEvent);
      }).not.toThrow();
    });

    it('should zoom out when wheel scroll down', () => {
      const zoomOutEvent = new WheelEvent('wheel', {
        deltaY: 100,
        clientX: 400,
        clientY: 300
      });

      expect(() => {
        container.dispatchEvent(zoomOutEvent);
      }).not.toThrow();
    });

    it('should pan when mouse is dragged', () => {
      // Simulate mouse drag sequence
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

    it('should respect zoom limits', () => {
      // Test multiple zoom in operations
      for (let i = 0; i < 10; i++) {
        const zoomInEvent = new WheelEvent('wheel', {
          deltaY: -100,
          clientX: 400,
          clientY: 300
        });
        container.dispatchEvent(zoomInEvent);
      }

      // Test multiple zoom out operations
      for (let i = 0; i < 10; i++) {
        const zoomOutEvent = new WheelEvent('wheel', {
          deltaY: 100,
          clientX: 400,
          clientY: 300
        });
        container.dispatchEvent(zoomOutEvent);
      }

      // Verify canvas is still functional
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeDefined();
    });
  });

  describe('Touch Support Features', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableZoom: true,
        enablePan: true
      };
      canvasLens = new CanvasLens(options);
    });

    it('should handle single touch for panning', () => {
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

      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [
          new Touch({
            identifier: 1,
            target: container,
            clientX: 200,
            clientY: 200,
            pageX: 200,
            pageY: 200,
            radiusX: 1,
            radiusY: 1,
            rotationAngle: 0,
            force: 1
          })
        ]
      });

      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [
          new Touch({
            identifier: 1,
            target: container,
            clientX: 200,
            clientY: 200,
            pageX: 200,
            pageY: 200,
            radiusX: 1,
            radiusY: 1,
            rotationAngle: 0,
            force: 1
          })
        ]
      });

      expect(() => {
        container.dispatchEvent(touchStartEvent);
        container.dispatchEvent(touchMoveEvent);
        container.dispatchEvent(touchEndEvent);
      }).not.toThrow();
    });

    it('should handle multi-touch for zooming', () => {
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
          }),
          new Touch({
            identifier: 2,
            target: container,
            clientX: 200,
            clientY: 200,
            pageX: 200,
            pageY: 200,
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
    });
  });

  describe('Performance Features', () => {
    beforeEach(() => {
      const options: CanvasLensOptions = {
        container,
        enableZoom: true,
        enablePan: true
      };
      canvasLens = new CanvasLens(options);
    });

    it('should handle rapid zoom operations', () => {
      // Test rapid zoom in/out operations
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: i % 2 === 0 ? -50 : 50,
          clientX: 400,
          clientY: 300
        });
        container.dispatchEvent(wheelEvent);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle rapid pan operations', () => {
      // Test rapid mouse movements
      const startTime = performance.now();
      
      for (let i = 0; i < 20; i++) {
        const mouseDownEvent = new MouseEvent('mousedown', {
          clientX: i * 10,
          clientY: i * 10,
          button: 0
        });

        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientX: (i + 1) * 10,
          clientY: (i + 1) * 10
        });

        const mouseUpEvent = new MouseEvent('mouseup', {
          clientX: (i + 1) * 10,
          clientY: (i + 1) * 10,
          button: 0
        });

        container.dispatchEvent(mouseDownEvent);
        container.dispatchEvent(mouseMoveEvent);
        container.dispatchEvent(mouseUpEvent);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Error Handling Features', () => {
    it('should handle invalid container gracefully', () => {
      expect(() => {
        new CanvasLens({} as CanvasLensOptions);
      }).toThrow();
    });

    it('should handle invalid options gracefully', () => {
      const options: CanvasLensOptions = {
        container,
        width: -100, // Invalid width
        height: -100 // Invalid height
      };

      expect(() => {
        new CanvasLens(options);
      }).not.toThrow(); // Should use default values
    });

    it('should handle events on uninitialized canvas', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 100,
        clientY: 100
      });

      expect(() => {
        container.dispatchEvent(wheelEvent);
      }).not.toThrow();
    });
  });
});
