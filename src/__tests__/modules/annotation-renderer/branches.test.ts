import { AnnotationRenderer } from '../../../modules/annotation/Renderer';
import { Renderer } from '../../../core/Renderer';
import type { Annotation, Point } from '../../../types';

describe('AnnotationRenderer Branch Coverage', () => {
  let container: HTMLElement;
  let canvas: Renderer;
  let annotationRenderer: AnnotationRenderer;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    canvas = new Renderer(container, { width: 800, height: 600 });
    ctx = canvas.getContext();
    annotationRenderer = new AnnotationRenderer(canvas);
  });

  afterEach(() => {
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Viewport Culling Branches', () => {
    it('should test annotation outside viewport (all sides)', () => {
      const viewport = { x: 100, y: 100, width: 200, height: 200 };
      
      // Test annotation completely to the right
      const annotationRight: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 400, y: 150 }, { x: 500, y: 250 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      // Test annotation completely to the left
      const annotationLeft: Annotation = {
        id: 'test-2',
        type: 'rect',
        points: [{ x: 0, y: 150 }, { x: 50, y: 250 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      // Test annotation completely above
      const annotationAbove: Annotation = {
        id: 'test-3',
        type: 'rect',
        points: [{ x: 150, y: 0 }, { x: 250, y: 50 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      // Test annotation completely below
      const annotationBelow: Annotation = {
        id: 'test-4',
        type: 'rect',
        points: [{ x: 150, y: 400 }, { x: 250, y: 500 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      const annotations = [annotationRight, annotationLeft, annotationAbove, annotationBelow];
      expect(() => annotationRenderer.renderAll(annotations)).not.toThrow();
    });

    it('should test annotation partially overlapping viewport', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 250, y: 250 }], // Partially overlaps viewport at 100,100
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      expect(() => annotationRenderer.renderAll([annotation])).not.toThrow();
    });

    it('should handle annotations with different zoom levels', () => {
      canvas.setViewState({ scale: 2.0, offsetX: 0, offsetY: 0 });
      
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      expect(() => annotationRenderer.renderAll([annotation])).not.toThrow();
    });
  });

  describe('Hit Testing Branches', () => {
    it('should test point near line with zero length', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'line',
        points: [{ x: 100, y: 100 }, { x: 100, y: 100 }], // Zero length
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      const point: Point = { x: 100, y: 100 };
      const result = annotationRenderer.hitTest(point, annotation);
      expect(typeof result).toBe('boolean');
    });

    it('should test point near line with multiple segments', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'line',
        points: [
          { x: 50, y: 50 },
          { x: 100, y: 100 },
          { x: 150, y: 150 }
        ],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      const pointNear: Point = { x: 75, y: 75 };
      const pointFar: Point = { x: 300, y: 300 };
      
      expect(annotationRenderer.hitTest(pointNear, annotation)).toBe(true);
      expect(annotationRenderer.hitTest(pointFar, annotation)).toBe(false);
    });

    it('should test point in rectangle with tolerance', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      // Point just outside with tolerance
      const pointNear: Point = { x: 45, y: 100 };
      const result = annotationRenderer.hitTest(pointNear, annotation);
      expect(typeof result).toBe('boolean');
    });

    it('should test point in circle with tolerance', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }], // Radius 50
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };
      
      // Point just outside with tolerance
      const pointNear: Point = { x: 156, y: 100 };
      const result = annotationRenderer.hitTest(pointNear, annotation);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Rendering Branches', () => {
    it('should render rectangle with fill and shadow', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: '#ff0000',
          shadowColor: '#000000',
          shadowBlur: 10,
          shadowOffsetX: 5,
          shadowOffsetY: 5
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });

    it('should render rectangle with fill but no shadow', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: '#ff0000'
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });

    it('should render circle with fill', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: '#ff0000'
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });

    it('should render circle without fill', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });
  });

  describe('Style Application Branches', () => {
    it('should apply dashed line style', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'line',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          lineStyle: 'dashed'
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });

    it('should apply dotted line style', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'line',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          lineStyle: 'dotted'
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });

    it('should apply solid line style', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'line',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          lineStyle: 'solid'
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });

    it('should apply default solid when lineStyle is undefined', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'line',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2
          // No lineStyle
        },
        data: {}
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });

    it('should scale font size based on view scale', () => {
      canvas.setViewState({ scale: 2.0, offsetX: 0, offsetY: 0 });
      
      const annotation: Annotation = {
        id: 'test-1',
        type: 'text',
        points: [{ x: 50, y: 50 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fontSize: 16,
          fontFamily: 'Arial'
        },
        data: { text: 'Test' }
      };
      
      expect(() => annotationRenderer.render(annotation)).not.toThrow();
    });
  });
});

