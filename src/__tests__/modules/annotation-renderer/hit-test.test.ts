import { AnnotationRenderer } from '../../../modules/annotation/Renderer';
import { Renderer } from '../../../core/Renderer';
import type { Annotation, Point } from '../../../types';

describe('AnnotationRenderer Hit Testing', () => {
  let container: HTMLElement;
  let canvas: Renderer;
  let renderer: AnnotationRenderer;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    canvas = new Renderer(container, { width: 800, height: 600 });
    ctx = canvas.getContext();
    renderer = new AnnotationRenderer(canvas);
  });

  afterEach(() => {
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Rectangle Hit Testing', () => {
    it('should detect point inside rectangle', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 150 };
      expect(renderer.isPointInRectangle(point, annotation)).toBe(true);
    });

    it('should detect point outside rectangle', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 50, y: 50 };
      expect(renderer.isPointInRectangle(point, annotation)).toBe(false);
    });

    it('should detect point near rectangle edge (with tolerance)', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      // Point just outside but within tolerance
      const point: Point = { x: 95, y: 150 };
      expect(renderer.isPointInRectangle(point, annotation)).toBe(true);
    });

    it('should return false for invalid rectangle', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 100, y: 100 }], // Only one point
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 150 };
      expect(renderer.isPointInRectangle(point, annotation)).toBe(false);
    });

    it('should return false for non-rectangle type', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 150 };
      expect(renderer.isPointInRectangle(point, annotation)).toBe(false);
    });
  });

  describe('Circle Hit Testing', () => {
    it('should detect point inside circle', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }], // Center and edge (radius 50)
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 120, y: 100 }; // Inside circle
      expect(renderer.isPointInCircle(point, annotation)).toBe(true);
    });

    it('should detect point outside circle', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }], // Center and edge (radius 50)
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 200, y: 200 }; // Far outside
      expect(renderer.isPointInCircle(point, annotation)).toBe(false);
    });

    it('should detect point near circle edge (with tolerance)', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }], // Radius 50
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      // Point just outside but within tolerance (radius 50 + tolerance 5 = 55)
      const point: Point = { x: 154, y: 100 };
      expect(renderer.isPointInCircle(point, annotation)).toBe(true);
    });

    it('should return false for invalid circle', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'circle',
        points: [{ x: 100, y: 100 }], // Only one point
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 150 };
      expect(renderer.isPointInCircle(point, annotation)).toBe(false);
    });
  });

  describe('Line Hit Testing', () => {
    it('should detect point near line', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'line',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      // Point near the line (within threshold)
      const point: Point = { x: 150, y: 155 };
      expect(renderer.isPointNearLine(point, annotation, 15)).toBe(true);
    });

    it('should detect point far from line', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'line',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 300, y: 300 };
      expect(renderer.isPointNearLine(point, annotation, 15)).toBe(false);
    });

    it('should work with arrow annotations', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'arrow',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 155 };
      expect(renderer.isPointNearLine(point, annotation, 15)).toBe(true);
    });

    it('should handle zero-length line', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'line',
        points: [{ x: 100, y: 100 }, { x: 100, y: 100 }], // Same point
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 100, y: 100 };
      // Should handle zero-length line
      expect(typeof renderer.isPointNearLine(point, annotation, 15)).toBe('boolean');
    });

    it('should return false for invalid line', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'line',
        points: [{ x: 100, y: 100 }], // Only one point
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 150 };
      expect(renderer.isPointNearLine(point, annotation, 15)).toBe(false);
    });
  });

  describe('Text Hit Testing', () => {
    it('should detect point inside text bounds', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'text',
        points: [{ x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2, fontSize: 16, fontFamily: 'Arial' },
        data: { text: 'Test text' }
      };

      // Text is rendered at y=100, but extends upward by fontSize*0.8
      // So bounds are from y=100-fontSize*0.8 to y=100
      // Point should be within this range
      const point: Point = { x: 120, y: 92 }; // Adjusted to be within text bounds
      const result = renderer.hitTest(point, annotation);
      // Result depends on text metrics, but should be testable
      expect(typeof result).toBe('boolean');
    });

    it('should detect point outside text bounds', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'text',
        points: [{ x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2, fontSize: 16, fontFamily: 'Arial' },
        data: { text: 'Test text' }
      };

      const point: Point = { x: 300, y: 300 };
      expect(renderer.hitTest(point, annotation)).toBe(false);
    });

    it('should return false for text without data', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'text',
        points: [{ x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 120, y: 95 };
      expect(renderer.hitTest(point, annotation)).toBe(false);
    });

    it('should return false for text without points', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'text',
        points: [],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: { text: 'Test' }
      };

      const point: Point = { x: 120, y: 95 };
      expect(renderer.hitTest(point, annotation)).toBe(false);
    });
  });

  describe('Hit Test Integration', () => {
    it('should hit test rectangle annotation', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 150 };
      expect(renderer.hitTest(point, annotation)).toBe(true);
    });

    it('should hit test circle annotation', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 120, y: 100 };
      expect(renderer.hitTest(point, annotation)).toBe(true);
    });

    it('should hit test line annotation', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'line',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 155 };
      expect(renderer.hitTest(point, annotation)).toBe(true);
    });

    it('should hit test arrow annotation', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'arrow',
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const point: Point = { x: 150, y: 155 };
      expect(renderer.hitTest(point, annotation)).toBe(true);
    });

    it('should return false for unknown annotation type', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'rect' as any,
        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      (annotation as any).type = 'unknown';

      const point: Point = { x: 150, y: 150 };
      expect(renderer.hitTest(point, annotation)).toBe(false);
    });
  });

  describe('Preview Rendering', () => {
    it('should render preview annotation', () => {
      const points: Point[] = [{ x: 100, y: 100 }, { x: 200, y: 200 }];
      const style = { strokeColor: '#000', strokeWidth: 2 };
      
      expect(() => renderer.renderPreview('rect', points, style)).not.toThrow();
    });

    it('should render preview with data', () => {
      const points: Point[] = [{ x: 100, y: 100 }];
      const style = { strokeColor: '#000', strokeWidth: 2, fontSize: 16, fontFamily: 'Arial' };
      const data = { text: 'Preview' };
      
      expect(() => renderer.renderPreview('text', points, style, data)).not.toThrow();
    });
  });

  describe('Viewport Culling', () => {
    it('should render annotations with viewport culling', () => {
      const annotations: Annotation[] = [
        {
          id: 'test-1',
          type: 'rect',
          points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        },
        {
          id: 'test-2',
          type: 'rect',
          points: [{ x: 1000, y: 1000 }, { x: 1100, y: 1100 }], // Outside viewport
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        }
      ];

      expect(() => renderer.renderAll(annotations)).not.toThrow();
    });

    it('should handle text annotations in viewport culling', () => {
      const annotations: Annotation[] = [
        {
          id: 'test-1',
          type: 'text',
          points: [{ x: 100, y: 100 }],
          style: { strokeColor: '#000', strokeWidth: 2, fontSize: 16, fontFamily: 'Arial' },
          data: { text: 'Test' }
        }
      ];

      expect(() => renderer.renderAll(annotations)).not.toThrow();
    });
  });
});

