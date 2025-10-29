import type { Renderer } from '../../../core/Renderer';
import type { EventHandlerOptions } from '../../../types';
import type { ImageViewer } from '../../image-viewer/Viewer';
import type { AnnotationManager } from '../Manager';
import type { AnnotationRenderer } from '../Renderer';
import type { BaseTool } from './components/BaseTool';

// Type-safe alias với proper types để tránh circular dependency
type TypedEventHandlerOptions = EventHandlerOptions<
  Renderer,
  AnnotationRenderer,
  BaseTool | null,
  AnnotationManager | undefined
>;

// Helper function để check comparison mode với type safety
function isComparisonModeActive(imageViewer: unknown): boolean {
  if (imageViewer && typeof imageViewer === 'object' && 'isComparisonMode' in imageViewer) {
    const mode = (imageViewer as ImageViewer).isComparisonMode();
    if (typeof mode === 'boolean') {
      return mode;
    }
  }
  return false;
}

export class AnnotationToolsEventHandler {
  private options: TypedEventHandlerOptions;

  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundMouseLeave: (event: MouseEvent) => void;
  private boundKeyDown: (event: KeyboardEvent) => void;
  private boundAnnotationCreated: (event: CustomEvent) => void;

  constructor(options: TypedEventHandlerOptions) {
    this.options = options;

    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundMouseLeave = this.handleMouseLeave.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundAnnotationCreated = this.handleAnnotationCreated.bind(this);
  }

  /**
   * Setup event listeners for drawing interactions
   */
  setupEventListeners(): void {
    const canvas = this.options.canvas;
    canvas.addEventListener('mousedown', this.boundMouseDown as EventListener, true);
    canvas.addEventListener('mousemove', this.boundMouseMove as EventListener);
    canvas.addEventListener('mouseup', this.boundMouseUp as EventListener);
    canvas.addEventListener('mouseleave', this.boundMouseLeave as EventListener);

    document.addEventListener('mousemove', this.boundMouseMove as EventListener);
    document.addEventListener('mouseup', this.boundMouseUp as EventListener);

    canvas.getElement().addEventListener('annotationCreated', this.boundAnnotationCreated as EventListener);

    document.addEventListener('keydown', this.boundKeyDown, true);

    // Set initial cursor
    this.updateCursor();
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    const currentTool = this.options.currentTool;
    if (!currentTool || event.button !== 0) {
      return; // Only left mouse button
    }

    if (!this.options.activeToolType) {
      return;
    }

    // Check flag - if false, tool might not be ready yet (race condition)
    if (!this.options.toolActivatedByKeyboard) {
      // Give it a moment for the flag to be set if tool was just activated
      return;
    }

    // Don't allow drawing when comparison mode is active
    const canvas = this.options.canvas;
    if (canvas.imageViewer && isComparisonModeActive(canvas.imageViewer)) {
      return; // Block drawing when comparison mode is active
    }

    // Don't prevent default for text tool to allow proper focus
    if (this.options.activeToolType !== 'text') {
      event.preventDefault();
    }
    event.stopPropagation();
    event.stopImmediatePropagation();

    const point = canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);

    if (!this.options.onIsPointInImageBounds(worldPoint)) {
      return;
    }

    const annotation = currentTool.startDrawing(worldPoint);

    if (canvas.annotationManager) {
      canvas.annotationManager.selectAnnotation(null);
    }

    if (annotation) {
      if (this.options.onMeetsMinimumSize(annotation)) {
        if (this.options.onAnnotationCreate) {
          this.options.onAnnotationCreate(annotation);
        }

        if (this.options.annotationManager) {
          this.options.annotationManager.selectAnnotation(annotation);
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
    const currentTool = this.options.currentTool;
    if (!currentTool || !currentTool.isCurrentlyDrawing()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const canvas = this.options.canvas;
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
    const currentTool = this.options.currentTool;
    if (!currentTool || !currentTool.isCurrentlyDrawing()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const canvas = this.options.canvas;
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
          this.options.annotationManager.selectAnnotation(annotation);
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
    const currentTool = this.options.currentTool;
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
      const annotationManager = this.options.annotationManager;
      if (annotationManager) {
        const selectedAnnotation = annotationManager.getSelectedAnnotation();
        if (selectedAnnotation) {
          annotationManager.removeAnnotation(selectedAnnotation.id);
        }
        event.preventDefault();
        return;
      }
    }

    if (event.key === 'Escape') {
      const currentTool = this.options.currentTool;
      if (currentTool && this.options.toolManagerDrawing) {
        currentTool.cancelDrawing();
      } else if (this.options.activeToolType) {
        this.options.onDeactivateTool();
        this.updateCursor();
      } else if (this.options.annotationManager) {
        this.options.annotationManager.selectAnnotation(null);
      }
      return;
    }

    if (event.altKey) {
      // Don't allow tool activation when comparison mode is active
      const canvas = this.options.canvas;
      if (canvas.imageViewer && isComparisonModeActive(canvas.imageViewer)) {
        return; // Block tool activation when comparison mode is active
      }

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
          this.updateCursor();
        } else {
          this.options.onActivateTool(toolType);
          // Options will be updated by Manager's updateEventHandlerOptions callback
          // But we need to ensure flag is set immediately for the next click
          // So we read it directly from the controller if possible
          this.updateCursor();
        }
      }
    }
  }

  /**
   * Update cursor based on active tool
   */
  private updateCursor(): void {
    const canvas = this.options.canvas;
    if (!canvas) return;

    // Don't set tool cursor when comparison mode is active and no tool is active
    if (!this.options.activeToolType) {
      if (canvas.imageViewer && isComparisonModeActive(canvas.imageViewer)) {
        // Let comparison manager handle cursor when no tool is active
        return;
      }
      // Reset cursor when no tool is active
      canvas.getElement().style.cursor = '';
      return;
    }

    if (this.options.activeToolType) {
      // Set cursor based on tool type
      const cursorMap: Record<string, string> = {
        'text': 'text',
        'rect': 'crosshair',
        'arrow': 'crosshair',
        'circle': 'crosshair',
        'line': 'crosshair'
      };

      const cursor = cursorMap[this.options.activeToolType] || 'crosshair';
      canvas.getElement().style.cursor = cursor;
    }
  }


  /**
   * Update options (for dynamic updates)
   */
  updateOptions(newOptions: Partial<TypedEventHandlerOptions>): void {
    const wasActive = !!this.options.activeToolType;
    this.options = { ...this.options, ...newOptions };
    const isActive = !!this.options.activeToolType;
    
    // Update cursor if tool activation state changed
    if (wasActive !== isActive || (isActive && this.options.activeToolType !== newOptions.activeToolType)) {
      this.updateCursor();
    }
  }

  /**
   * Destroy event handler and clean up
   */
  destroy(): void {
    const canvas = this.options.canvas;
    canvas.removeEventListener('mousedown', this.boundMouseDown as EventListener, true);
    canvas.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    canvas.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    canvas.removeEventListener('mouseleave', this.boundMouseLeave as EventListener);

    document.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    document.removeEventListener('mouseup', this.boundMouseUp as EventListener);

    document.removeEventListener('keydown', this.boundKeyDown, true);

    canvas.getElement().removeEventListener('annotationCreated', this.boundAnnotationCreated as EventListener);
  }
}
