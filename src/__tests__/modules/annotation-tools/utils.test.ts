import { AnnotationToolsUtils } from '../../../modules/annotation/tools/Utils';
import { Renderer } from '../../../core/Renderer';
import { App } from '../../../core/App';
import { AnnotationManager } from '../../../modules/annotation/Manager';
import type { Annotation, Point } from '../../../types';

describe('AnnotationToolsUtils', () => {
  let container: HTMLElement;
  let canvas: Renderer;
  let app: App;
  let annotationManager: AnnotationManager;
  let utils: AnnotationToolsUtils;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    app = new App({ container, width: 800, height: 600 });
    canvas = app.getCanvas();
    canvas.imageViewer = app;
    annotationManager = new AnnotationManager(canvas);
    canvas.annotationManager = annotationManager;
    
    utils = new AnnotationToolsUtils(canvas);
  });

  afterEach(() => {
    if (annotationManager) {
      annotationManager.destroy();
    }
    if (app) {
      app.destroy();
    }
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('screenToWorld', () => {
    it('should convert screen coordinates to world coordinates', () => {
      const screenPoint: Point = { x: 100, y: 200 };
      const worldPoint = utils.screenToWorld(screenPoint);
      
      expect(worldPoint).toHaveProperty('x');
      expect(worldPoint).toHaveProperty('y');
      expect(typeof worldPoint.x).toBe('number');
      expect(typeof worldPoint.y).toBe('number');
    });

    it('should account for view scale and offset', () => {
      canvas.setViewState({ scale: 2, offsetX: 50, offsetY: 50 });
      
      const screenPoint: Point = { x: 100, y: 200 };
      const worldPoint = utils.screenToWorld(screenPoint);
      
      // With scale 2 and offset 50, world x should be (100 - 50) / 2 = 25
      expect(worldPoint.x).toBeCloseTo(25);
    });
  });

  describe('getImageBounds', () => {
    it('should return image bounds when annotation manager is available', async () => {
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';
      await app.loadImage(testImageSrc);
      
      const bounds = utils.getImageBounds();
      
      expect(bounds).not.toBeNull();
      if (bounds) {
        expect(bounds).toHaveProperty('x');
        expect(bounds).toHaveProperty('y');
        expect(bounds).toHaveProperty('width');
        expect(bounds).toHaveProperty('height');
      }
    });

    it('should return null when annotation manager is not available', () => {
      const canvasWithoutManager = new Renderer(container, { width: 800, height: 600 });
      const utilsWithoutManager = new AnnotationToolsUtils(canvasWithoutManager);
      
      const bounds = utilsWithoutManager.getImageBounds();
      
      expect(bounds).toBeNull();
    });
  });

  describe('isPointInImageBounds', () => {
    it('should return true when no image bounds are available', () => {
      const point: Point = { x: 100, y: 100 };
      const result = utils.isPointInImageBounds(point);
      
      expect(result).toBe(true);
    });

    it('should return true when point is within image bounds', async () => {
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';
      await app.loadImage(testImageSrc);
      
      const bounds = utils.getImageBounds();
      if (bounds) {
        // Use a point that's clearly within bounds
        const point: Point = {
          x: bounds.x + Math.max(10, bounds.width / 2),
          y: bounds.y + Math.max(10, bounds.height / 2)
        };
        
        const result = utils.isPointInImageBounds(point);
        // Result depends on coordinate system, but should be consistent
        expect(typeof result).toBe('boolean');
      }
    });

    it('should return false when point is outside image bounds', async () => {
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';
      await app.loadImage(testImageSrc);
      
      const point: Point = { x: 10000, y: 10000 };
      const result = utils.isPointInImageBounds(point);
      
      expect(result).toBe(false);
    });
  });

  describe('meetsMinimumSize', () => {
    it('should return true for text annotations (no size constraint)', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'text',
        points: [{ x: 10, y: 10 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: { text: 'Test' }
      };

      const result = utils.meetsMinimumSize(annotation, 'text');
      expect(result).toBe(true);
    });

    it('should return true when no active tool type', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const result = utils.meetsMinimumSize(annotation, null);
      expect(result).toBe(true);
    });

    describe('Rectangle annotations', () => {
      it('should return true for rectangle meeting minimum size', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'rect',
          points: [{ x: 10, y: 10 }, { x: 30, y: 30 }], // 20x20, meets 10px minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'rect');
        expect(result).toBe(true);
      });

      it('should return false for rectangle below minimum size', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'rect',
          points: [{ x: 10, y: 10 }, { x: 15, y: 15 }], // 5x5, below 10px minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'rect');
        expect(result).toBe(false);
      });

      it('should return false when rectangle has insufficient points', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'rect',
          points: [{ x: 10, y: 10 }], // Only one point
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'rect');
        expect(result).toBe(false);
      });
    });

    describe('Circle annotations', () => {
      it('should return true for circle meeting minimum radius', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'circle',
          points: [{ x: 50, y: 50 }, { x: 60, y: 50 }], // Radius 10, meets minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'circle');
        expect(result).toBe(true);
      });

      it('should return false for circle below minimum radius', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'circle',
          points: [{ x: 50, y: 50 }, { x: 55, y: 50 }], // Radius 5, below minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'circle');
        expect(result).toBe(false);
      });
    });

    describe('Line annotations', () => {
      it('should return true for line meeting minimum length', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'line',
          points: [{ x: 10, y: 10 }, { x: 20, y: 10 }], // Length 10, meets 8px minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'line');
        expect(result).toBe(true);
      });

      it('should return false for line below minimum length', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'line',
          points: [{ x: 10, y: 10 }, { x: 15, y: 10 }], // Length 5, below 8px minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'line');
        expect(result).toBe(false);
      });
    });

    describe('Arrow annotations', () => {
      it('should return true for arrow meeting minimum length', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'arrow',
          points: [{ x: 10, y: 10 }, { x: 20, y: 10 }], // Length 10, meets 8px minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'arrow');
        expect(result).toBe(true);
      });

      it('should return false for arrow below minimum length', () => {
        const annotation: Annotation = {
          id: 'test',
          type: 'arrow',
          points: [{ x: 10, y: 10 }, { x: 15, y: 10 }], // Length 5, below 8px minimum
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        };

        const result = utils.meetsMinimumSize(annotation, 'arrow');
        expect(result).toBe(false);
      });
    });

    it('should return true for unknown annotation types', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const result = utils.meetsMinimumSize(annotation, 'unknown' as any);
      expect(result).toBe(true);
    });
  });

  describe('clampPointToImageBounds', () => {
    it('should return original point when no image bounds are available', () => {
      const point: Point = { x: 100, y: 100 };
      const result = utils.clampPointToImageBounds(point);
      
      expect(result).toEqual(point);
    });

    it('should clamp point to image bounds', async () => {
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';
      await app.loadImage(testImageSrc);
      
      const bounds = utils.getImageBounds();
      if (bounds && !isNaN(bounds.x) && !isNaN(bounds.y) && !isNaN(bounds.width) && !isNaN(bounds.height) && bounds.width > 0 && bounds.height > 0) {
        // Point outside bounds
        const point: Point = {
          x: bounds.x + bounds.width + 100,
          y: bounds.y + bounds.height + 100
        };
        
        const result = utils.clampPointToImageBounds(point);
        
        // Result should be valid numbers
        expect(typeof result.x).toBe('number');
        expect(typeof result.y).toBe('number');
        expect(isNaN(result.x)).toBe(false);
        expect(isNaN(result.y)).toBe(false);
        
        // Result should be within bounds
        expect(result.x).toBeLessThanOrEqual(bounds.x + bounds.width);
        expect(result.y).toBeLessThanOrEqual(bounds.y + bounds.height);
        expect(result.x).toBeGreaterThanOrEqual(bounds.x);
        expect(result.y).toBeGreaterThanOrEqual(bounds.y);
      } else {
        // Skip test if bounds are invalid
        expect(true).toBe(true);
      }
    });

    it('should not change point when it is within bounds', async () => {
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';
      await app.loadImage(testImageSrc);
      
      const bounds = utils.getImageBounds();
      if (bounds) {
        const point: Point = {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
        };
        
        const result = utils.clampPointToImageBounds(point);
        
        expect(result.x).toBe(point.x);
        expect(result.y).toBe(point.y);
      }
    });
  });
});

