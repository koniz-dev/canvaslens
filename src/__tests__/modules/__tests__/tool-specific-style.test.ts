import { AnnotationManager } from '../../../modules/annotation/Manager';
import { Renderer } from '../../../core/Renderer';
import { RectangleTool } from '../../../modules/annotation/tools/components/RectangleTool';
import { CircleTool } from '../../../modules/annotation/tools/components/CircleTool';
import { LineTool } from '../../../modules/annotation/tools/components/LineTool';
import { ArrowTool } from '../../../modules/annotation/tools/components/ArrowTool';
import { TextTool } from '../../../modules/annotation/tools/components/TextTool';
import { AnnotationRenderer } from '../../../modules/annotation/Renderer';
import type { AnnotationStyle } from '../../../types';

describe('Tool-Specific Style Tests', () => {
  let canvas: Renderer;
  let annotationManager: AnnotationManager;
  let renderer: AnnotationRenderer;

  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 800;
    canvasElement.height = 600;
    container.appendChild(canvasElement);
    
    canvas = new Renderer(container, { width: 800, height: 600 });
    renderer = new AnnotationRenderer(canvas);
  });

  afterEach(() => {
    const container = canvas.getElement().parentElement;
    if (container) {
      document.body.removeChild(container);
    }
  });

  describe('RectangleTool Style', () => {
    it('should apply style to rectangle annotation', () => {
      const style: AnnotationStyle = {
        strokeColor: '#ff0000',
        strokeWidth: 3,
        lineStyle: 'dashed',
        fillColor: 'rgba(255, 0, 0, 0.2)'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: style
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('rect');
      const rectTool = controller.getCurrentTool() as RectangleTool;

      const annotation = rectTool.startDrawing({ x: 10, y: 10 });
      if (annotation) {
        rectTool.continueDrawing({ x: 100, y: 100 });
        const finalAnnotation = rectTool.finishDrawing({ x: 100, y: 100 });

        if (finalAnnotation) {
          expect(finalAnnotation.type).toBe('rect');
          expect(finalAnnotation.style.strokeColor).toBe('#ff0000');
          expect(finalAnnotation.style.fillColor).toBe('rgba(255, 0, 0, 0.2)');
          expect(finalAnnotation.style.lineStyle).toBe('dashed');
        }
      }
    });

    it('should render rectangle with fill and stroke', () => {
      const annotation = {
        id: 'test-rect',
        type: 'rect' as const,
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: 'rgba(255, 0, 0, 0.3)'
        } as AnnotationStyle,
        data: {}
      };

      const fillRectSpy = jest.spyOn(renderer['ctx'], 'fillRect');
      const strokeRectSpy = jest.spyOn(renderer['ctx'], 'strokeRect');

      renderer.render(annotation);

      expect(fillRectSpy).toHaveBeenCalled();
      expect(strokeRectSpy).toHaveBeenCalled();

      fillRectSpy.mockRestore();
      strokeRectSpy.mockRestore();
    });
  });

  describe('CircleTool Style', () => {
    it('should apply style to circle annotation', () => {
      const style: AnnotationStyle = {
        strokeColor: '#00ff00',
        strokeWidth: 4,
        lineStyle: 'dotted',
        fillColor: 'rgba(0, 255, 0, 0.3)'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: style
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('circle');
      const circleTool = controller.getCurrentTool() as CircleTool;

      const annotation = circleTool.startDrawing({ x: 100, y: 100 });
      if (annotation) {
        circleTool.continueDrawing({ x: 150, y: 100 });
        const finalAnnotation = circleTool.finishDrawing({ x: 150, y: 100 });

        if (finalAnnotation) {
          expect(finalAnnotation.type).toBe('circle');
          expect(finalAnnotation.style.strokeColor).toBe('#00ff00');
          expect(finalAnnotation.style.fillColor).toBe('rgba(0, 255, 0, 0.3)');
          expect(finalAnnotation.style.lineStyle).toBe('dotted');
        }
      }
    });

    it('should render circle with fill and stroke', () => {
      const annotation = {
        id: 'test-circle',
        type: 'circle' as const,
        points: [{ x: 100, y: 100 }, { x: 150, y: 100 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 2,
          fillColor: 'rgba(0, 255, 0, 0.3)'
        } as AnnotationStyle,
        data: {}
      };

      const fillSpy = jest.spyOn(renderer['ctx'], 'fill');
      const strokeSpy = jest.spyOn(renderer['ctx'], 'stroke');

      renderer.render(annotation);

      expect(fillSpy).toHaveBeenCalled();
      expect(strokeSpy).toHaveBeenCalled();

      fillSpy.mockRestore();
      strokeSpy.mockRestore();
    });
  });

  describe('LineTool Style', () => {
    it('should apply style to line annotation', () => {
      const style: AnnotationStyle = {
        strokeColor: '#0000ff',
        strokeWidth: 3,
        lineStyle: 'dashed'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: style
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('line');
      const lineTool = controller.getCurrentTool() as LineTool;

      const annotation = lineTool.startDrawing({ x: 10, y: 10 });
      if (annotation) {
        lineTool.continueDrawing({ x: 200, y: 200 });
        const finalAnnotation = lineTool.finishDrawing({ x: 200, y: 200 });

        if (finalAnnotation) {
          expect(finalAnnotation.type).toBe('line');
          expect(finalAnnotation.style.strokeColor).toBe('#0000ff');
          expect(finalAnnotation.style.lineStyle).toBe('dashed');
        }
      }
    });
  });

  describe('ArrowTool Style', () => {
    it('should apply style to arrow annotation', () => {
      const style: AnnotationStyle = {
        strokeColor: '#ffff00',
        strokeWidth: 4,
        lineStyle: 'solid'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: style
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('arrow');
      const arrowTool = controller.getCurrentTool() as ArrowTool;

      const annotation = arrowTool.startDrawing({ x: 10, y: 10 });
      if (annotation) {
        arrowTool.continueDrawing({ x: 200, y: 200 });
        const finalAnnotation = arrowTool.finishDrawing({ x: 200, y: 200 });

        if (finalAnnotation) {
          expect(finalAnnotation.type).toBe('arrow');
          expect(finalAnnotation.style.strokeColor).toBe('#ffff00');
          expect(finalAnnotation.style.lineStyle).toBe('solid');
        }
      }
    });
  });

  describe('TextTool Style', () => {
    it('should apply fontSize and fontFamily to text annotation', () => {
      const style: AnnotationStyle = {
        strokeColor: '#000000',
        strokeWidth: 1,
        fontSize: 20,
        fontFamily: 'Georgia, serif'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: style
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;
      controller.activateTool('text');
      const textTool = controller.getCurrentTool() as TextTool;

      const annotation = textTool.startDrawing({ x: 50, y: 50 });
      if (annotation && annotation.data) {
        annotation.data.text = 'Test text';
        const finalAnnotation = textTool.finishDrawing({ x: 50, y: 50 });

        if (finalAnnotation) {
          expect(finalAnnotation.type).toBe('text');
          expect(finalAnnotation.style.fontSize).toBe(20);
          expect(finalAnnotation.style.fontFamily).toBe('Georgia, serif');
        }
      }
    });

    it('should render text with custom font', () => {
      const annotation = {
        id: 'test-text',
        type: 'text' as const,
        points: [{ x: 50, y: 50 }],
        style: {
          strokeColor: '#000',
          strokeWidth: 1,
          fontSize: 18,
          fontFamily: 'Arial'
        } as AnnotationStyle,
        data: {
          text: 'Test text'
        }
      };

      const fillTextSpy = jest.spyOn(renderer['ctx'], 'fillText');
      const originalFont = renderer['ctx'].font;

      renderer.render(annotation);

      expect(fillTextSpy).toHaveBeenCalledWith('Test text', 50, 50);
      expect(renderer['ctx'].font).not.toBe(originalFont);
      expect(renderer['ctx'].font).toContain('Arial');

      fillTextSpy.mockRestore();
    });
  });

  describe('Style Consistency Across Tools', () => {
    it('should apply same default style to all tool types', () => {
      const style: AnnotationStyle = {
        strokeColor: '#ff00ff',
        strokeWidth: 5,
        lineStyle: 'dotted',
        fillColor: 'rgba(255, 0, 255, 0.2)'
      };

      annotationManager = new AnnotationManager(canvas, {
        enabled: true,
        defaultStyle: style
      });

      const toolManager = (annotationManager as any).toolManager;
      const controller = (toolManager as any).controller;

      controller.activateTool('rect');
      const rectTool = controller.getCurrentTool();
      controller.activateTool('circle');
      const circleTool = controller.getCurrentTool();
      controller.activateTool('line');
      const lineTool = controller.getCurrentTool();
      controller.activateTool('arrow');
      const arrowTool = controller.getCurrentTool();

      const rectAnn = rectTool.startDrawing({ x: 0, y: 0 });
      rectTool.continueDrawing({ x: 10, y: 10 });
      const rectAnnotation = rectTool.finishDrawing({ x: 10, y: 10 });

      const circleAnn = circleTool.startDrawing({ x: 0, y: 0 });
      circleTool.continueDrawing({ x: 10, y: 0 });
      const circleAnnotation = circleTool.finishDrawing({ x: 10, y: 0 });

      const lineAnn = lineTool.startDrawing({ x: 0, y: 0 });
      lineTool.continueDrawing({ x: 10, y: 10 });
      const lineAnnotation = lineTool.finishDrawing({ x: 10, y: 10 });

      const arrowAnn = arrowTool.startDrawing({ x: 0, y: 0 });
      arrowTool.continueDrawing({ x: 10, y: 10 });
      const arrowAnnotation = arrowTool.finishDrawing({ x: 10, y: 10 });

      // All should have same style
      if (rectAnnotation) {
        expect(rectAnnotation.style.strokeColor).toBe('#ff00ff');
        expect(rectAnnotation.style.strokeWidth).toBe(5);
      }
      if (circleAnnotation) {
        expect(circleAnnotation.style.strokeColor).toBe('#ff00ff');
        expect(circleAnnotation.style.strokeWidth).toBe(5);
      }
      if (lineAnnotation) {
        expect(lineAnnotation.style.strokeColor).toBe('#ff00ff');
        expect(lineAnnotation.style.strokeWidth).toBe(5);
      }
      if (arrowAnnotation) {
        expect(arrowAnnotation.style.strokeColor).toBe('#ff00ff');
        expect(arrowAnnotation.style.strokeWidth).toBe(5);
      }
    });
  });
});

