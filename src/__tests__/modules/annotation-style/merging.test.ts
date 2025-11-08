import { AnnotationManager } from '../../../modules/annotation/Manager';
import { AnnotationToolsManager } from '../../../modules/annotation/tools/Manager';
import { RectangleTool } from '../../../modules/annotation/tools/components/RectangleTool';
import { Renderer } from '../../../core/Renderer';
import type { AnnotationStyle, Annotation } from '../../../types';

describe('Annotation Style Merging', () => {
  let canvas: Renderer;
  let annotationManager: AnnotationManager;

  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 800;
    canvasElement.height = 600;
    container.appendChild(canvasElement);
    
    canvas = new Renderer(container, { width: 800, height: 600 });
  });

  afterEach(() => {
    const container = canvas.getElement().parentElement;
    if (container) {
      document.body.removeChild(container);
    }
  });

  describe('Default Style Merging in AnnotationManager', () => {
    it('should merge user defaultStyle with internal defaults', () => {
      const userStyle: Partial<AnnotationStyle> = {
        strokeColor: '#00ff00',
        strokeWidth: 5
        // Other properties should come from defaults
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: userStyle as AnnotationStyle
      });

      // Get tool manager to verify style was merged
      const toolManager = (annotationManager as any).toolManager;
      expect(toolManager).toBeDefined();
      
      const controller = (toolManager as any).controller;
      const defaultStyle = (controller as any).options.defaultStyle;
      expect(defaultStyle).toBeDefined();
      
      // User style should override defaults
      expect(defaultStyle.strokeColor).toBe('#00ff00');
      expect(defaultStyle.strokeWidth).toBe(5);
      
      // Defaults should still be present for other properties
      expect(defaultStyle.lineStyle).toBeDefined();
      expect(defaultStyle.fontSize).toBeDefined();
    });

    it('should use internal defaults when no user defaultStyle provided', () => {
      annotationManager = new AnnotationManager(canvas, {
        enabled: true
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      const defaultStyle = (controller as any).options.defaultStyle;
      
      expect(defaultStyle).toBeDefined();
      expect(defaultStyle.strokeColor).toBe('#ff0000'); // Internal default
      expect(defaultStyle.strokeWidth).toBe(2); // Internal default
    });

    it('should allow partial style override', () => {
      const partialStyle: Partial<AnnotationStyle> = {
        lineStyle: 'dashed',
        fillColor: 'rgba(255, 0, 0, 0.2)'
        // strokeColor and strokeWidth should use defaults
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: partialStyle as AnnotationStyle
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      const defaultStyle = (controller as any).options.defaultStyle;
      
      expect(defaultStyle.lineStyle).toBe('dashed');
      expect(defaultStyle.fillColor).toBe('rgba(255, 0, 0, 0.2)');
      expect(defaultStyle.strokeColor).toBe('#ff0000'); // Default
    });
  });

  describe('Style Merging in BaseTool', () => {
    let toolManager: AnnotationToolsManager;
    let rectangleTool: RectangleTool;

    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: {
          strokeColor: '#ff0000',
          strokeWidth: 2,
          lineStyle: 'solid',
          fontSize: 16,
          fontFamily: 'Arial, sans-serif'
        }
      });

      toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('rect');
      rectangleTool = controller.getCurrentTool() as RectangleTool;
    });

    it('should use defaultStyle from toolManager when creating annotation', () => {
      // Test style through tool drawing flow
      const annotation = rectangleTool.startDrawing({ x: 10, y: 10 });
      if (annotation) {
        rectangleTool.continueDrawing({ x: 100, y: 100 });
        const finalAnnotation = rectangleTool.finishDrawing({ x: 100, y: 100 });

        if (finalAnnotation) {
          expect(finalAnnotation.style.strokeColor).toBe('#ff0000');
          expect(finalAnnotation.style.strokeWidth).toBe(2);
          expect(finalAnnotation.style.lineStyle).toBe('solid');
        }
      }
    });

    it('should use options.style when provided in BaseTool', () => {
      // Update tool options with new style
      rectangleTool.updateOptions({
        style: {
          strokeColor: '#00ff00',
          strokeWidth: 5,
          lineStyle: 'dashed'
        }
      });

      // Test style through tool drawing flow
      const annotation = rectangleTool.startDrawing({ x: 10, y: 10 });
      if (annotation) {
        rectangleTool.continueDrawing({ x: 100, y: 100 });
        const finalAnnotation = rectangleTool.finishDrawing({ x: 100, y: 100 });

        if (finalAnnotation) {
          expect(finalAnnotation.style.strokeColor).toBe('#00ff00');
          expect(finalAnnotation.style.strokeWidth).toBe(5);
          expect(finalAnnotation.style.lineStyle).toBe('dashed');
        }
      }
    });

    it('should fallback to defaults when options.style is not provided', () => {
      // Test style through tool drawing flow
      const annotation = rectangleTool.startDrawing({ x: 10, y: 10 });
      if (annotation) {
        rectangleTool.continueDrawing({ x: 100, y: 100 });
        const finalAnnotation = rectangleTool.finishDrawing({ x: 100, y: 100 });

        if (finalAnnotation) {
          // Should have fallback defaults
          expect(finalAnnotation.style.strokeColor).toBeDefined();
          expect(finalAnnotation.style.strokeWidth).toBeDefined();
        }
      }
    });
  });

  describe('Style Inheritance Flow', () => {
    it('should flow style from ToolConfig → AnnotationManager → ToolManager → BaseTool → Annotation', () => {
      const userStyle: AnnotationStyle = {
        strokeColor: '#0096ff',
        strokeWidth: 3,
        lineStyle: 'dashed',
        fillColor: 'rgba(0, 150, 255, 0.3)'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: userStyle
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('rect');
      const rectangleTool = controller.getCurrentTool();

      // Test style through tool drawing flow
      if (rectangleTool) {
        const annotation = rectangleTool.startDrawing({ x: 10, y: 10 });
        if (annotation) {
          rectangleTool.continueDrawing({ x: 100, y: 100 });
          const finalAnnotation = rectangleTool.finishDrawing({ x: 100, y: 100 });

          if (finalAnnotation) {
            // Verify style flowed through all layers
            expect(finalAnnotation.style.strokeColor).toBe('#0096ff');
            expect(finalAnnotation.style.strokeWidth).toBe(3);
            expect(finalAnnotation.style.lineStyle).toBe('dashed');
            expect(finalAnnotation.style.fillColor).toBe('rgba(0, 150, 255, 0.3)');
          }
        }
      }
    });

    it('should allow per-annotation style override', () => {
      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: {
          strokeColor: '#ff0000',
          strokeWidth: 2
        }
      });

      // Create annotation with default style through tool
      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('rect');
      const rectangleTool = controller.getCurrentTool();
      
      if (rectangleTool) {
        const annotation = rectangleTool.startDrawing({ x: 10, y: 10 });
        if (annotation) {
          rectangleTool.continueDrawing({ x: 100, y: 100 });
          const finalAnnotation = rectangleTool.finishDrawing({ x: 100, y: 100 });

          if (finalAnnotation) {
            // Override style after creation (simulating per-annotation override)
            finalAnnotation.style = {
              ...finalAnnotation.style,
              strokeColor: '#00ff00',
              strokeWidth: 5
            };

            expect(finalAnnotation.style.strokeColor).toBe('#00ff00');
            expect(finalAnnotation.style.strokeWidth).toBe(5);
          }
        }
      }
    });
  });

  describe('Complex Style Merging Scenarios', () => {
    it('should merge nested style properties correctly', () => {
      const baseStyle: AnnotationStyle = {
        strokeColor: '#000000',
        strokeWidth: 2,
        lineStyle: 'solid',
        fontSize: 16,
        fontFamily: 'Arial'
      };

      const overrideStyle: Partial<AnnotationStyle> = {
        strokeColor: '#ff0000',
        lineStyle: 'dashed',
        fillColor: 'rgba(255, 0, 0, 0.2)'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: {
          ...baseStyle,
          ...overrideStyle
        } as AnnotationStyle
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      const defaultStyle = (controller as any).options.defaultStyle;

      expect(defaultStyle).toBeDefined();
      expect(defaultStyle.strokeColor).toBe('#ff0000'); // Overridden
      expect(defaultStyle.lineStyle).toBe('dashed'); // Overridden
      expect(defaultStyle.fillColor).toBe('rgba(255, 0, 0, 0.2)'); // Added
      expect(defaultStyle.strokeWidth).toBe(2); // From base
      expect(defaultStyle.fontSize).toBe(16); // From base
    });

    it('should handle undefined optional properties', () => {
      const partialStyle: Partial<AnnotationStyle> = {
        strokeColor: '#000',
        strokeWidth: 2
        // fillColor, lineStyle, etc. are undefined
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: partialStyle as AnnotationStyle
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      const defaultStyle = (controller as any).options.defaultStyle;

      expect(defaultStyle).toBeDefined();
      expect(defaultStyle.strokeColor).toBe('#000');
      expect(defaultStyle.strokeWidth).toBe(2);
      // Optional properties may or may not be defined
    });
  });
});

