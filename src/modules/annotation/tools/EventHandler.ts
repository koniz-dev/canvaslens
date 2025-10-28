import { Renderer } from '@/core';
import { Annotation, Point } from '@/types';
import { AnnotationRenderer } from '../Renderer';
import { AnnotationManager } from '../Manager';
import { BaseTool } from './components';

export interface EventHandlerOptions {
  canvas: Renderer;
  renderer: AnnotationRenderer;
  currentTool: BaseTool | null;
  activeToolType: string | null;
  toolActivatedByKeyboard: boolean;
  toolManagerDrawing: boolean;
  onAnnotationCreate?: (annotation: Annotation) => void | undefined;
  annotationManager?: AnnotationManager;
  onActivateTool: (toolType: string) => boolean;
  onDeactivateTool: () => void;
  onScreenToWorld: (screenPoint: Point) => Point;
  onIsPointInImageBounds: (point: Point) => boolean;
  onMeetsMinimumSize: (annotation: Annotation) => boolean;
  onClampPointToImageBounds: (point: Point) => Point;
}

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
    this.options.canvas.addEventListener('mousedown', this.boundMouseDown as EventListener, true);
    this.options.canvas.addEventListener('mousemove', this.boundMouseMove as EventListener);
    this.options.canvas.addEventListener('mouseup', this.boundMouseUp as EventListener);
    this.options.canvas.addEventListener('mouseleave', this.boundMouseLeave as EventListener);

    document.addEventListener('mousemove', this.boundMouseMove as EventListener);
    document.addEventListener('mouseup', this.boundMouseUp as EventListener);

    this.options.canvas.getElement().addEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);

    document.addEventListener('keydown', this.boundKeyDown, true);
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.options.currentTool || event.button !== 0) {
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
    
    const point = this.options.canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);
    
    if (!this.options.onIsPointInImageBounds(worldPoint)) {
      return;
    }
    
    const annotation = this.options.currentTool.startDrawing(worldPoint);
    
    if (this.options.canvas.annotationManager && 'selectAnnotation' in this.options.canvas.annotationManager) {
      (this.options.canvas.annotationManager as any).selectAnnotation(null);
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
    if (!this.options.currentTool || !this.options.currentTool.isCurrentlyDrawing()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.options.canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);
    
    const clampedPoint = this.options.onClampPointToImageBounds(worldPoint);
    
    this.options.currentTool.continueDrawing(clampedPoint);
    
    this.options.canvas.getElement().dispatchEvent(new CustomEvent('viewStateChange'));
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.options.currentTool || !this.options.currentTool.isCurrentlyDrawing()) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.options.canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);
    
    const clampedPoint = this.options.onClampPointToImageBounds(worldPoint);
    
    const annotation = this.options.currentTool.finishDrawing(clampedPoint);
    
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
    if (!this.options.currentTool) return;
    
    this.options.currentTool.cancelDrawing();
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
      if (this.options.annotationManager && this.options.annotationManager.getSelectedAnnotation()) {
        const selectedAnnotation = this.options.annotationManager.getSelectedAnnotation();
        if (selectedAnnotation) {
          this.options.annotationManager.removeAnnotation(selectedAnnotation.id);
        }
        event.preventDefault();
        return;
      }
    }

    if (event.key === 'Escape') {
      if (this.options.currentTool && this.options.toolManagerDrawing) {
        this.options.currentTool.cancelDrawing();
      } else if (this.options.activeToolType) {
        this.options.onDeactivateTool();
      } else if (this.options.annotationManager) {
        this.options.annotationManager.selectAnnotation(null);
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
    this.options.canvas.removeEventListener('mousedown', this.boundMouseDown as EventListener, true);
    this.options.canvas.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    this.options.canvas.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    this.options.canvas.removeEventListener('mouseleave', this.boundMouseLeave as EventListener);
    
    document.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    document.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    
    document.removeEventListener('keydown', this.boundKeyDown, true);

    this.options.canvas.getElement().removeEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);
  }
}
