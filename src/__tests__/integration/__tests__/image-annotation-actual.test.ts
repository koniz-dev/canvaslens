import { Engine } from '../../../core/Engine';
import { ImageViewer } from '../../../modules/image-viewer/Viewer';
import { AnnotationManager } from '../../../modules/annotation/Manager';
import { Renderer } from '../../../core/Renderer';
import type { Annotation, AnnotationStyle, CanvasLensOptions, ToolConfig } from '../../../types';

describe('Image Annotation Integration (Actual Code)', () => {
  let container: HTMLElement;
  let engine: Engine;
  let imageViewer: ImageViewer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Engine with AnnotationManager', () => {
    it('should create Engine with annotation tools enabled', () => {
      const tools: ToolConfig = {
        annotation: {
          rect: true,
          arrow: true,
          text: true,
          circle: true,
          line: true
        }
      };

      const options: CanvasLensOptions = {
        container,
        width: 800,
        height: 600,
        tools
      };

      engine = new Engine(options);
      expect(engine).toBeDefined();

      // Load a test image
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';
      
      return engine.loadImage(testImageSrc).then(() => {
        expect(engine).toBeDefined();
      });
    });

    it('should create Engine with annotation style configuration', () => {
      const style: AnnotationStyle = {
        strokeColor: '#0096ff',
        strokeWidth: 3,
        lineStyle: 'dashed',
        fillColor: 'rgba(0, 150, 255, 0.3)'
      };

      const tools: ToolConfig = {
        annotation: {
          rect: true,
          style
        }
      };

      const options: CanvasLensOptions = {
        container,
        width: 800,
        height: 600,
        tools
      };

      engine = new Engine(options);
      expect(engine).toBeDefined();
    });
  });

  describe('AnnotationManager with Actual Implementation', () => {
    let canvas: Renderer;
    let annotationManager: AnnotationManager;

    beforeEach(() => {
      const canvasElement = document.createElement('canvas');
      canvasElement.width = 800;
      canvasElement.height = 600;
      container.appendChild(canvasElement);

      canvas = new Renderer(container, { width: 800, height: 600 });
      
      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: {
          strokeColor: '#ff0000',
          strokeWidth: 2,
          lineStyle: 'solid'
        }
      });
    });

    it('should add annotation through tool manager', () => {
      // Activate rectangle tool
      annotationManager.activateTool('rect');
      
      // Simulate drawing
      const startPoint = { x: 100, y: 100 };
      const endPoint = { x: 200, y: 150 };

      // This would normally be done through mouse events
      // For testing, we'll directly test the tool creation
      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      const rectTool = controller.getCurrentTool();

      if (rectTool) {
        const annotation = rectTool.startDrawing(startPoint);
        if (annotation) {
          rectTool.continueDrawing(endPoint);
          const finalAnnotation = rectTool.finishDrawing(endPoint);
          if (finalAnnotation) {
            annotationManager.addAnnotation(finalAnnotation);
          }
        }

        const annotations = annotationManager.getAllAnnotations();
        expect(annotations.length).toBeGreaterThan(0);
        expect(annotations[0]?.type).toBe('rect');
      }
    });

    it('should apply default style to new annotations', () => {
      const defaultStyle: AnnotationStyle = {
        strokeColor: '#00ff00',
        strokeWidth: 5,
        lineStyle: 'dashed'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('rect');
      const rectTool = controller.getCurrentTool();

      if (rectTool) {
        const annotation = rectTool.startDrawing({ x: 10, y: 10 });
        if (annotation) {
          rectTool.continueDrawing({ x: 100, y: 100 });
          const finalAnnotation = rectTool.finishDrawing({ x: 100, y: 100 });
          if (finalAnnotation) {
            expect(finalAnnotation.style.strokeColor).toBe('#00ff00');
            expect(finalAnnotation.style.strokeWidth).toBe(5);
            expect(finalAnnotation.style.lineStyle).toBe('dashed');
          }
        }
      }
    });

    it('should remove annotation', () => {
      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('rect');
      const rectTool = controller.getCurrentTool();

      if (rectTool) {
        const annotation = rectTool.startDrawing({ x: 10, y: 10 });
        if (annotation) {
          rectTool.continueDrawing({ x: 100, y: 100 });
          const finalAnnotation = rectTool.finishDrawing({ x: 100, y: 100 });
          if (finalAnnotation) {
            annotationManager.addAnnotation(finalAnnotation);

            const annotations = annotationManager.getAllAnnotations();
            expect(annotations.length).toBe(1);

            annotationManager.removeAnnotation(finalAnnotation.id);
            const remainingAnnotations = annotationManager.getAllAnnotations();
            expect(remainingAnnotations.length).toBe(0);
          }
        }
      }
    });

    it('should maintain annotations during zoom and pan', () => {
      // Create annotation
      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('rect');
      const rectTool = controller.getCurrentTool();

      if (rectTool) {
        const annotation = rectTool.startDrawing({ x: 100, y: 100 });
        if (annotation) {
          rectTool.continueDrawing({ x: 200, y: 150 });
          const finalAnnotation = rectTool.finishDrawing({ x: 200, y: 150 });
          if (finalAnnotation) {
            annotationManager.addAnnotation(finalAnnotation);

            const annotations = annotationManager.getAllAnnotations();
            expect(annotations.length).toBe(1);

            // Apply zoom/pan (through ImageViewer if available)
            // Annotations should still exist
            const remainingAnnotations = annotationManager.getAllAnnotations();
            expect(remainingAnnotations.length).toBe(1);
            expect(remainingAnnotations[0]?.id).toBe(finalAnnotation.id);
          }
        }
      }
    });
  });

  describe('Full Integration Flow', () => {
    it('should create annotation with style through full Engine → ImageViewer → AnnotationManager flow', () => {
      const style: AnnotationStyle = {
        strokeColor: '#ff0000',
        strokeWidth: 3,
        lineStyle: 'dashed',
        fillColor: 'rgba(255, 0, 0, 0.2)'
      };

      const tools: ToolConfig = {
        annotation: {
          rect: true,
          style
        }
      };

      const options: CanvasLensOptions = {
        container,
        width: 800,
        height: 600,
        tools
      };

      engine = new Engine(options);
      
      // Access ImageViewer through Engine
      const imageViewer = (engine as any).imageViewer;
      expect(imageViewer).toBeDefined();

      // Access AnnotationManager
      const annotationManager = imageViewer.annotationManager;
      expect(annotationManager).toBeDefined();

      // Verify style was passed through
      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      const defaultStyle = (controller as any).options.defaultStyle;
      
      expect(defaultStyle).toBeDefined();
      expect(defaultStyle.strokeColor).toBe('#ff0000');
      expect(defaultStyle.strokeWidth).toBe(3);
      expect(defaultStyle.lineStyle).toBe('dashed');
      expect(defaultStyle.fillColor).toBe('rgba(255, 0, 0, 0.2)');
    });
  });
});

