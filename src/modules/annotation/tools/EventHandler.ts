import type { Renderer } from '../../../core/Renderer';
import type { EventHandlerOptions } from '../../../types';
import type { BaseTool } from './components/BaseTool';

export class AnnotationToolsEventHandler {
  private options: EventHandlerOptions;

  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundMouseLeave: (event: MouseEvent) => void;
  private boundKeyDown: (event: KeyboardEvent) => void;

  constructor(options: EventHandlerOptions) {
    this.options = options;

    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundMouseLeave = this.handleMouseLeave.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Setup event listeners for drawing interactions
   */
  setupEventListeners(): void {
    const canvas = this.options.canvas as unknown as Renderer;
    canvas.addEventListener('mousedown', this.boundMouseDown as EventListener, true);
    canvas.addEventListener('mousemove', this.boundMouseMove as EventListener);
    canvas.addEventListener('mouseup', this.boundMouseUp as EventListener);
    canvas.addEventListener('mouseleave', this.boundMouseLeave as EventListener);

    document.addEventListener('mousemove', this.boundMouseMove as EventListener);
    document.addEventListener('mouseup', this.boundMouseUp as EventListener);

    canvas.getElement().addEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);

    document.addEventListener('keydown', this.boundKeyDown, true);
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    const currentTool = this.options.currentTool as unknown as BaseTool | null;
    if (!currentTool || event.button !== 0) {
      return; // Only left mouse button
    }

    if (!this.options.activeToolType) {
      return;
    }

    if (!this.options.toolActivatedByKeyboard) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const canvas = this.options.canvas as unknown as Renderer;
    const point = canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);

    if (!this.options.onIsPointInImageBounds(worldPoint)) {
      return;
    }

    const annotation = currentTool.startDrawing(worldPoint);

    if (canvas.annotationManager && 'selectAnnotation' in canvas.annotationManager) {
      (canvas.annotationManager as { selectAnnotation: (id: string | null) => void }).selectAnnotation(null);
    }

    if (annotation) {
      if (this.options.onMeetsMinimumSize(annotation)) {
        if (this.options.onAnnotationCreate) {
          this.options.onAnnotationCreate(annotation);
        }

        if (this.options.annotationManager) {
          (this.options.annotationManager as { selectAnnotation: (annotation: unknown) => void }).selectAnnotation(annotation);
        }
      } else {
        // Annotation doesn't meet minimum size requirements
      }
    }
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    const currentTool = this.options.currentTool as unknown as BaseTool | null;
    if (!currentTool || !currentTool.isCurrentlyDrawing()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const canvas = this.options.canvas as unknown as Renderer;
    const point = canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);

    const clampedPoint = this.options.onClampPointToImageBounds(worldPoint);

    currentTool.continueDrawing(clampedPoint);

    canvas.getElement().dispatchEvent(new CustomEvent('viewStateChange'));
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    const currentTool = this.options.currentTool as unknown as BaseTool | null;
    if (!currentTool || !currentTool.isCurrentlyDrawing()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const canvas = this.options.canvas as unknown as Renderer;
    const point = canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);

    const clampedPoint = this.options.onClampPointToImageBounds(worldPoint);

    const annotation = currentTool.finishDrawing(clampedPoint);

    if (annotation) {
      if (this.options.onMeetsMinimumSize(annotation)) {
        if (this.options.onAnnotationCreate) {
          this.options.onAnnotationCreate(annotation);
        }

        if (this.options.annotationManager) {
          (this.options.annotationManager as { selectAnnotation: (annotation: unknown) => void }).selectAnnotation(annotation);
        }
      } else {
        // Annotation doesn't meet minimum size requirements
      }
    }
  }

  /**
   * Handle mouse leave event
   */
  private handleMouseLeave(_event: MouseEvent): void {
    const currentTool = this.options.currentTool as unknown as BaseTool | null;
    if (!currentTool) return;

    currentTool.cancelDrawing();
  }

  /**
   * Handle custom annotation created event (from TextTool)
   */
  private handleAnnotationCreated(event: CustomEvent): void {
    const annotation = event.detail;
    if (annotation && this.options.onAnnotationCreate) {
      this.options.onAnnotationCreate(annotation);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(event: KeyboardEvent): void {

    if (event.key === 'Delete' || event.key === 'Backspace') {
      const annotationManager = this.options.annotationManager as { getSelectedAnnotation: () => unknown; removeAnnotation: (id: string) => void } | null;
      if (annotationManager && annotationManager.getSelectedAnnotation()) {
        const selectedAnnotation = annotationManager.getSelectedAnnotation() as { id: string } | null;
        if (selectedAnnotation) {
          annotationManager.removeAnnotation(selectedAnnotation.id);
        }
        event.preventDefault();
        return;
      }
    }

    if (event.key === 'Escape') {
      const currentTool = this.options.currentTool as unknown as BaseTool | null;
      if (currentTool && this.options.toolManagerDrawing) {
        currentTool.cancelDrawing();
      } else if (this.options.activeToolType) {
        this.options.onDeactivateTool();
      } else if (this.options.annotationManager) {
        (this.options.annotationManager as { selectAnnotation: (id: string | null) => void }).selectAnnotation(null);
      }
      return;
    }

    if (event.altKey) {
      const keyToToolMap: Record<string, string> = {
        'r': 'rect',
        'a': 'arrow',
        't': 'text',
        'c': 'circle',
        'l': 'line'
      };

      const toolType = keyToToolMap[event.key.toLowerCase()];
      if (toolType) {
        event.preventDefault();
        if (this.options.activeToolType === toolType) {
          this.options.onDeactivateTool();
        } else {
          this.options.onActivateTool(toolType);
        }
      }
    }
  }


  /**
   * Update options (for dynamic updates)
   */
  updateOptions(newOptions: Partial<EventHandlerOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Destroy event handler and clean up
   */
  destroy(): void {
    const canvas = this.options.canvas as unknown as Renderer;
    canvas.removeEventListener('mousedown', this.boundMouseDown as EventListener, true);
    canvas.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    canvas.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    canvas.removeEventListener('mouseleave', this.boundMouseLeave as EventListener);

    document.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    document.removeEventListener('mouseup', this.boundMouseUp as EventListener);

    document.removeEventListener('keydown', this.boundKeyDown, true);

    canvas.getElement().removeEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);
  }
}
