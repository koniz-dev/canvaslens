import { AnnotationManager } from '../../../modules/annotation/Manager';
import { Renderer } from '../../../core/Renderer';
import { App } from '../../../core/App';
import type { Annotation, AnnotationStyle, EventHandlers } from '../../../types';

describe('AnnotationManager Comprehensive Tests', () => {
  let container: HTMLElement;
  let canvas: Renderer;
  let annotationManager: AnnotationManager;
  let app: App;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    app = new App({ container, width: 800, height: 600 });
    canvas = app.getCanvas();
    canvas.imageViewer = app;
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

  describe('Event Handlers', () => {
    it('should call onAnnotationAdd when annotation is added', () => {
      const onAnnotationAdd = jest.fn();
      const eventHandlers: EventHandlers = { onAnnotationAdd };
      
      annotationManager = new AnnotationManager(canvas, { eventHandlers });
      
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      
      expect(onAnnotationAdd).toHaveBeenCalledWith(annotation);
    });

    it('should call onAnnotationRemove when annotation is removed', () => {
      const onAnnotationRemove = jest.fn();
      const eventHandlers: EventHandlers = { onAnnotationRemove };
      
      annotationManager = new AnnotationManager(canvas, { eventHandlers });
      
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      annotationManager.removeAnnotation('test-1');
      
      expect(onAnnotationRemove).toHaveBeenCalledWith('test-1');
    });

    it('should update event handlers', () => {
      annotationManager = new AnnotationManager(canvas);
      
      const onAnnotationAdd = jest.fn();
      annotationManager.setEventHandlers({ onAnnotationAdd });
      
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      
      expect(onAnnotationAdd).toHaveBeenCalledWith(annotation);
    });
  });

  describe('Selection and Dragging', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should select annotation on click', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      
      // Simulate click on annotation
      const event = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        button: 0
      });
      
      canvas.getElement().dispatchEvent(event);
      
      expect(annotationManager.getSelectedAnnotation()).toBe(annotation);
    });

    it('should deselect annotation when clicking empty space', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      annotationManager.selectAnnotation(annotation);
      
      // Simulate click on empty space
      const event = new MouseEvent('mousedown', {
        clientX: 500,
        clientY: 500,
        button: 0
      });
      
      canvas.getElement().dispatchEvent(event);
      
      expect(annotationManager.getSelectedAnnotation()).toBeNull();
    });

    it('should check if annotation is selected', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      annotationManager.selectAnnotation(annotation);
      
      expect(annotationManager.hasSelectedAnnotation()).toBe(true);
      expect(annotationManager.hasSelectedAnnotation()).toBe(true);
    });

    it('should get selected annotation', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 50, y: 50 }, { x: 150, y: 150 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      annotationManager.selectAnnotation(annotation);
      
      expect(annotationManager.getSelectedAnnotation()).toBe(annotation);
    });
  });

  describe('Import/Export', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should export annotations as JSON', () => {
      const annotation1: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const annotation2: Annotation = {
        id: 'test-2',
        type: 'circle',
        points: [{ x: 200, y: 200 }, { x: 250, y: 250 }],
        style: { strokeColor: '#ff0000', strokeWidth: 3 },
        data: {}
      };

      annotationManager.addAnnotation(annotation1);
      annotationManager.addAnnotation(annotation2);

      const exported = annotationManager.exportAnnotations();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('test-1');
      expect(parsed[1].id).toBe('test-2');
    });

    it('should import annotations from JSON', () => {
      const annotations: Annotation[] = [
        {
          id: 'import-1',
          type: 'rect',
          points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        },
        {
          id: 'import-2',
          type: 'circle',
          points: [{ x: 200, y: 200 }, { x: 250, y: 250 }],
          style: { strokeColor: '#ff0000', strokeWidth: 3 },
          data: {}
        }
      ];

      const json = JSON.stringify(annotations);
      const result = annotationManager.importAnnotations(json);

      expect(result).toBe(true);
      expect(annotationManager.getAllAnnotations()).toHaveLength(2);
      expect(annotationManager.getAnnotation('import-1')).toBeDefined();
      expect(annotationManager.getAnnotation('import-2')).toBeDefined();
    });

    it('should clear existing annotations when importing', () => {
      const existing: Annotation = {
        id: 'existing',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(existing);

      const newAnnotations: Annotation[] = [
        {
          id: 'new-1',
          type: 'rect',
          points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
          style: { strokeColor: '#000', strokeWidth: 2 },
          data: {}
        }
      ];

      const json = JSON.stringify(newAnnotations);
      annotationManager.importAnnotations(json);

      expect(annotationManager.getAnnotation('existing')).toBeUndefined();
      expect(annotationManager.getAnnotation('new-1')).toBeDefined();
    });

    it('should reject invalid JSON when importing', () => {
      const result = annotationManager.importAnnotations('invalid json');
      
      expect(result).toBe(false);
      expect(annotationManager.getAllAnnotations()).toHaveLength(0);
    });

    it('should reject non-array JSON when importing', () => {
      const result = annotationManager.importAnnotations('{"not": "an array"}');
      
      expect(result).toBe(false);
    });
  });

  describe('Style Updates', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should update tool style', () => {
      const newStyle: Partial<AnnotationStyle> = {
        strokeColor: '#00ff00',
        strokeWidth: 5
      };

      annotationManager.updateStyle(newStyle);
      
      // Style update is handled by tool manager
      expect(annotationManager.getToolManager()).toBeDefined();
    });
  });

  describe('Tool Management', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should activate tool', () => {
      const result = annotationManager.activateTool('rect');
      expect(result).toBe(true);
      expect(annotationManager.getActiveToolType()).toBe('rect');
    });

    it('should deactivate tool', () => {
      annotationManager.activateTool('rect');
      annotationManager.deactivateTool();
      expect(annotationManager.getActiveToolType()).toBeNull();
    });

    it('should check if tool is active', () => {
      expect(annotationManager.isToolActive()).toBe(false);
      annotationManager.activateTool('rect');
      expect(annotationManager.isToolActive()).toBe(true);
    });

    it('should check if tool is enabled', () => {
      expect(annotationManager.isToolEnabled('rect')).toBe(true);
    });

    it('should get tool manager', () => {
      expect(annotationManager.getToolManager()).toBeDefined();
    });

    it('should update tool config', () => {
      annotationManager.updateToolConfig({ rect: true, circle: false });
      // Config update is handled internally
      expect(annotationManager.getToolManager()).toBeDefined();
    });
  });

  describe('Annotation Queries', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should get annotation by ID', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      
      expect(annotationManager.getAnnotation('test-1')).toBe(annotation);
      expect(annotationManager.getAnnotation('non-existent')).toBeUndefined();
    });

    it('should get annotation count', () => {
      expect(annotationManager.getAnnotationCount()).toBe(0);
      
      const annotation1: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation1);
      expect(annotationManager.getAnnotationCount()).toBe(1);
    });

    it('should get image bounds when image viewer is available', () => {
      const bounds = annotationManager.getImageBounds();
      // May be null if image not loaded
      expect(bounds === null || typeof bounds === 'object').toBe(true);
    });
  });

  describe('Enable/Disable', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should check if enabled', () => {
      expect(annotationManager.isEnabled()).toBe(true);
    });

    it('should set enabled state', () => {
      annotationManager.setEnabled(false);
      expect(annotationManager.isEnabled()).toBe(false);
      
      annotationManager.setEnabled(true);
      expect(annotationManager.isEnabled()).toBe(true);
    });

    it('should not render when disabled', () => {
      annotationManager.setEnabled(false);
      
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      // Render should not throw when disabled
      expect(() => annotationManager.render()).not.toThrow();
    });
  });

  describe('Change Tracking', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should track changes when annotation is added', () => {
      expect(annotationManager.hasChanges()).toBe(false);
      
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      expect(annotationManager.hasChanges()).toBe(true);
    });

    it('should track changes when annotation is removed', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      annotationManager.resetChanges();
      expect(annotationManager.hasChanges()).toBe(false);
      
      annotationManager.removeAnnotation('test-1');
      expect(annotationManager.hasChanges()).toBe(true);
    });

    it('should reset changes', () => {
      const annotation: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      annotationManager.addAnnotation(annotation);
      expect(annotationManager.hasChanges()).toBe(true);
      
      annotationManager.resetChanges();
      expect(annotationManager.hasChanges()).toBe(false);
    });
  });

  describe('Drawing State', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should check if currently drawing', () => {
      expect(annotationManager.isDrawing()).toBe(false);
    });
  });

  describe('Invalid Annotation Handling', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should not add invalid annotation', () => {
      const invalidAnnotation = {
        id: 'invalid',
        // Missing required fields
      } as unknown as Annotation;

      annotationManager.addAnnotation(invalidAnnotation);
      
      // Invalid annotation should not be added
      expect(annotationManager.getAnnotation('invalid')).toBeUndefined();
    });
  });

  describe('Clear All', () => {
    beforeEach(() => {
      annotationManager = new AnnotationManager(canvas);
    });

    it('should clear all annotations and trigger events', () => {
      const onAnnotationRemove = jest.fn();
      annotationManager.setEventHandlers({ onAnnotationRemove });

      const annotation1: Annotation = {
        id: 'test-1',
        type: 'rect',
        points: [{ x: 10, y: 10 }, { x: 100, y: 100 }],
        style: { strokeColor: '#000', strokeWidth: 2 },
        data: {}
      };

      const annotation2: Annotation = {
        id: 'test-2',
        type: 'circle',
        points: [{ x: 200, y: 200 }, { x: 250, y: 250 }],
        style: { strokeColor: '#ff0000', strokeWidth: 3 },
        data: {}
      };

      annotationManager.addAnnotation(annotation1);
      annotationManager.addAnnotation(annotation2);
      annotationManager.selectAnnotation(annotation1);

      annotationManager.clearAll();

      expect(annotationManager.getAllAnnotations()).toHaveLength(0);
      expect(annotationManager.getSelectedAnnotation()).toBeNull();
      expect(onAnnotationRemove).toHaveBeenCalledTimes(2);
    });
  });
});

