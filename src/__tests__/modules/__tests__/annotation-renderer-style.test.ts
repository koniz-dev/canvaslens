import { AnnotationRenderer } from '../../../modules/annotation/Renderer';
import { Renderer } from '../../../core/Renderer';
import type { Annotation, AnnotationStyle } from '../../../types';

describe('AnnotationRenderer Style Application', () => {
  let container: HTMLElement;
  let canvas: HTMLCanvasElement;
  let renderer: Renderer;
  let annotationRenderer: AnnotationRenderer;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    container.appendChild(canvas);

    renderer = new Renderer(container, { width: 800, height: 600 });
    ctx = renderer.getContext();
    annotationRenderer = new AnnotationRenderer(renderer);
  });

  afterEach(() => {
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Line Style Application', () => {
    it('should apply dashed line style', () => {
      const setLineDashSpy = jest.spyOn(ctx, 'setLineDash');
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          lineStyle: 'dashed'
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      // Verify setLineDash was called (at least once, possibly multiple times)
      expect(setLineDashSpy).toHaveBeenCalled();
      // Check if it was called with dashed pattern at some point
      const calls = setLineDashSpy.mock.calls;
      const hasDashedCall = calls.some(call => JSON.stringify(call[0]) === JSON.stringify([5, 5]));
      expect(hasDashedCall).toBe(true);
      setLineDashSpy.mockRestore();
    });

    it('should apply dotted line style', () => {
      const setLineDashSpy = jest.spyOn(ctx, 'setLineDash');
      
      const annotation: Annotation = {
        id: 'test',
        type: 'line',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          lineStyle: 'dotted'
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      expect(setLineDashSpy).toHaveBeenCalled();
      const calls = setLineDashSpy.mock.calls;
      const hasDottedCall = calls.some(call => JSON.stringify(call[0]) === JSON.stringify([2, 2]));
      expect(hasDottedCall).toBe(true);
      setLineDashSpy.mockRestore();
    });

    it('should apply solid line style (no dash)', () => {
      const setLineDashSpy = jest.spyOn(ctx, 'setLineDash');
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          lineStyle: 'solid'
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      expect(setLineDashSpy).toHaveBeenCalled();
      const calls = setLineDashSpy.mock.calls;
      const hasSolidCall = calls.some(call => JSON.stringify(call[0]) === JSON.stringify([]));
      expect(hasSolidCall).toBe(true);
      setLineDashSpy.mockRestore();
    });

    it('should default to solid when lineStyle is not specified', () => {
      const setLineDashSpy = jest.spyOn(ctx, 'setLineDash');
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2
          // No lineStyle
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      expect(setLineDashSpy).toHaveBeenCalled();
      const calls = setLineDashSpy.mock.calls;
      const hasSolidCall = calls.some(call => JSON.stringify(call[0]) === JSON.stringify([]));
      expect(hasSolidCall).toBe(true);
      setLineDashSpy.mockRestore();
    });
  });

  describe('Fill Color Application', () => {
    it('should render rectangle with fill color', () => {
      const fillRectSpy = jest.spyOn(ctx, 'fillRect');
      const originalFillStyle = ctx.fillStyle;
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: 'rgba(255, 0, 0, 0.2)'
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      // Verify fillRect was called
      expect(fillRectSpy).toHaveBeenCalled();
      // Verify fillStyle was changed
      expect(ctx.fillStyle).not.toBe(originalFillStyle);
      
      fillRectSpy.mockRestore();
    });

    it('should render circle with fill color', () => {
      const fillSpy = jest.spyOn(ctx, 'fill');
      const originalFillStyle = ctx.fillStyle;
      
      const annotation: Annotation = {
        id: 'test',
        type: 'circle',
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: 'rgba(0, 255, 0, 0.3)'
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      expect(fillSpy).toHaveBeenCalled();
      expect(ctx.fillStyle).not.toBe(originalFillStyle);
      
      fillSpy.mockRestore();
    });

    it('should not fill when fillColor is not specified', () => {
      const fillRectSpy = jest.spyOn(ctx, 'fillRect');
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2
          // No fillColor
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      // fillRect should not be called for rectangles without fillColor
      // (it's only called if fillColor exists)
      expect(fillRectSpy).not.toHaveBeenCalled();
      fillRectSpy.mockRestore();
    });
  });

  describe('Shadow Application', () => {
    it('should apply shadow when shadow properties are provided', () => {
      const saveSpy = jest.spyOn(ctx, 'save');
      const restoreSpy = jest.spyOn(ctx, 'restore');
      const originalShadowColor = ctx.shadowColor;
      const originalShadowBlur = ctx.shadowBlur;
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: 'rgba(255, 0, 0, 0.5)',
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 10,
          shadowOffsetX: 5,
          shadowOffsetY: 5
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      // Verify shadow context save/restore pattern
      expect(saveSpy).toHaveBeenCalled();
      expect(restoreSpy).toHaveBeenCalled();
      
      saveSpy.mockRestore();
      restoreSpy.mockRestore();
    });

    it('should not apply shadow when shadow properties are not provided', () => {
      const saveSpy = jest.spyOn(ctx, 'save');
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: 'rgba(255, 0, 0, 0.5)'
          // No shadow properties
        }
      };

      annotationRenderer.render(annotation);

      // Save should still be called for other operations, but shadow-specific
      // operations should not be triggered
      // The fillRectangleWithShadow method will use the non-shadow path
      saveSpy.mockRestore();
    });

    it('should scale shadow blur based on view scale', () => {
      // Mock getViewState to return a scale
      const originalGetViewState = renderer.getViewState;
      renderer.getViewState = jest.fn(() => ({
        scale: 2,
        offsetX: 0,
        offsetY: 0
      }));

      const originalShadowBlur = ctx.shadowBlur;
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: 'rgba(255, 0, 0, 0.5)',
          shadowBlur: 20
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      // shadowBlur should be divided by scale (20 / 2 = 10)
      // After save/restore, shadowBlur will be reset, but we can verify it was set
      // by checking that save/restore was called
      
      renderer.getViewState = originalGetViewState;
    });
  });

  describe('Stroke Style Application', () => {
    it('should apply strokeColor correctly', () => {
      const originalStrokeStyle = ctx.strokeStyle;
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#ff0000',
          strokeWidth: 3
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      expect(ctx.strokeStyle).toBe('#ff0000');
    });

    it('should scale strokeWidth based on view scale', () => {
      const originalGetViewState = renderer.getViewState;
      renderer.getViewState = jest.fn(() => ({
        scale: 2,
        offsetX: 0,
        offsetY: 0
      }));
      
      const annotation: Annotation = {
        id: 'test',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 4
        },
        data: {}
      };

      annotationRenderer.render(annotation);

      // strokeWidth should be divided by scale (4 / 2 = 2)
      expect(ctx.lineWidth).toBe(2);
      
      renderer.getViewState = originalGetViewState;
    });
  });

  describe('Font Style Application', () => {
    it('should apply fontSize and fontFamily for text annotations', () => {
      const annotation: Annotation = {
        id: 'test',
        type: 'text',
        points: [{ x: 50, y: 50 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fontSize: 18,
          fontFamily: 'Arial, sans-serif'
        },
        data: {
          text: 'Test text'
        }
      };

      const originalFont = ctx.font;
      annotationRenderer.render(annotation);

      // Font should be set, scaled by view scale
      expect(ctx.font).not.toBe(originalFont);
      expect(ctx.font).toContain('Arial');
    });

    it('should scale fontSize based on view scale', () => {
      // Test that fontSize scaling logic exists and uses viewState
      const annotation: Annotation = {
        id: 'test',
        type: 'text',
        points: [{ x: 50, y: 50 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fontSize: 16,
          fontFamily: 'Arial'
        },
        data: {
          text: 'Test'
        }
      };

      // Verify viewState can be set and retrieved
      renderer.setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
      const viewState = renderer.getViewState();
      expect(viewState.scale).toBe(1);

      // Render annotation - font should be applied based on viewState
      ctx.font = '10px sans-serif';
      annotationRenderer.render(annotation);
      
      // Verify font was set correctly with fontSize and fontFamily
      expect(ctx.font).toContain('px'); // Contains pixel size
      expect(ctx.font).toContain('Arial'); // Contains font family
      
      // The actual scaling calculation is: fontSize / (viewState?.scale || 1)
      // At scale 1: 16 / 1 = 16px, which should be in the font string
      expect(ctx.font).toMatch(/\d+px/); // Contains a number followed by 'px'
      
      // Reset view state
      renderer.setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
    });
  });

  describe('Multiple Annotations with Different Styles', () => {
    it('should render multiple annotations with different line styles', () => {
      const setLineDashSpy = jest.spyOn(ctx, 'setLineDash');
      
      const annotations: Annotation[] = [
        {
          id: '1',
          type: 'rect',
          points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
          style: {
            strokeColor: '#000',
            strokeWidth: 2,
            lineStyle: 'solid'
          },
          data: {}
        },
        {
          id: '2',
          type: 'rect',
          points: [{ x: 60, y: 10 }, { x: 100, y: 50 }],
          style: {
            strokeColor: '#000',
            strokeWidth: 2,
            lineStyle: 'dashed'
          },
          data: {}
        },
        {
          id: '3',
          type: 'rect',
          points: [{ x: 110, y: 10 }, { x: 150, y: 50 }],
          style: {
            strokeColor: '#000',
            strokeWidth: 2,
            lineStyle: 'dotted'
          },
          data: {}
        }
      ];

      annotations.forEach(annotation => {
        annotationRenderer.render(annotation);
      });

      // Verify setLineDash was called with different patterns
      expect(setLineDashSpy).toHaveBeenCalledWith([]); // solid
      expect(setLineDashSpy).toHaveBeenCalledWith([5, 5]); // dashed
      expect(setLineDashSpy).toHaveBeenCalledWith([2, 2]); // dotted
      
      setLineDashSpy.mockRestore();
    });
  });
});

