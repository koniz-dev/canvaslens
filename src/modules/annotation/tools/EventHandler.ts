import { Renderer } from '../../../core';
import { Annotation, Point } from '../../../types';
import { AnnotationRenderer } from '../Renderer';
import { BaseTool } from './components';

export interface EventHandlerOptions {
  canvas: Renderer;
  renderer: AnnotationRenderer;
  currentTool: BaseTool | null;
  activeToolType: string | null;
  toolActivatedByKeyboard: boolean;
  toolManagerDrawing: boolean;
  onAnnotationCreate?: (annotation: Annotation) => void | undefined;
  annotationManager?: any;
  onActivateTool: (toolType: string) => boolean;
  onDeactivateTool: () => void;
  onScreenToWorld: (screenPoint: Point) => Point;
  onIsPointInImageBounds: (point: Point) => boolean;
  onMeetsMinimumSize: (annotation: Annotation) => boolean;
  onClampPointToImageBounds: (point: Point) => Point;
}

export class AnnotationToolsEventHandler {
  private options: EventHandlerOptions;
  
  // Store bound event handlers for proper cleanup
  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundMouseLeave: (event: MouseEvent) => void;
  private boundKeyDown: (event: KeyboardEvent) => void;

  constructor(options: EventHandlerOptions) {
    this.options = options;

    // Bind event handlers to preserve context
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
    // Use capture phase to handle drawing events before other handlers
    this.options.canvas.addEventListener('mousedown', this.boundMouseDown as EventListener, true);
    this.options.canvas.addEventListener('mousemove', this.boundMouseMove as EventListener);
    this.options.canvas.addEventListener('mouseup', this.boundMouseUp as EventListener);
    this.options.canvas.addEventListener('mouseleave', this.boundMouseLeave as EventListener);

    // Also add to document to catch mouse events outside canvas
    document.addEventListener('mousemove', this.boundMouseMove as EventListener);
    document.addEventListener('mouseup', this.boundMouseUp as EventListener);

    // Listen for custom annotation created events (from TextTool)
    this.options.canvas.getElement().addEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);

    // Keyboard shortcuts - use document with capture to ensure we get events first
    document.addEventListener('keydown', this.boundKeyDown, true);
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.options.currentTool || event.button !== 0) {
      return; // Only left mouse button
    }
    
    // Start drawing if tool is active
    if (!this.options.activeToolType) {
      return; // No active tool
    }

    // Only allow drawing when tool was activated by keyboard shortcut (Alt+key)
    // Prevent drawing when tool was activated by button click
    if (!this.options.toolActivatedByKeyboard) {
      return; // Only allow drawing with Alt+keyboard shortcuts
    }

    // Stop all event propagation immediately to prevent zoom/pan from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.options.canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);
    
    // Check if the point is within image bounds
    if (!this.options.onIsPointInImageBounds(worldPoint)) {
      return; // Don't start drawing outside image bounds
    }
    
    const annotation = this.options.currentTool.startDrawing(worldPoint);
    
    // Clear any existing selection when starting new drawing
    if (this.options.canvas.annotationManager) {
      (this.options.canvas.annotationManager as any).selectAnnotation(null);
    }
    
    // If annotation was created immediately, add it to the manager
    if (annotation) {
      // Check if annotation meets minimum size requirements
      if (this.options.onMeetsMinimumSize(annotation)) {
        // Annotation is large enough, create it
        if (this.options.onAnnotationCreate) {
          this.options.onAnnotationCreate(annotation);
        }
        
        // Select the newly created annotation
        if (this.options.annotationManager) {
          this.options.annotationManager.selectAnnotation(annotation);
        }
      } else {
        // Annotation is too small, cancel it
      }
    }
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.options.currentTool || !this.options.currentTool.isCurrentlyDrawing()) return;

    // Stop all event propagation immediately to prevent zoom/pan from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.options.canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);
    
    // Clamp the point to image bounds if outside
    const clampedPoint = this.options.onClampPointToImageBounds(worldPoint);
    
    this.options.currentTool.continueDrawing(clampedPoint);
    
    // Trigger re-render to show updated annotation
    this.options.canvas.getElement().dispatchEvent(new CustomEvent('viewStateChange'));
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.options.currentTool || !this.options.currentTool.isCurrentlyDrawing()) return;

    // Stop all event propagation immediately to prevent zoom/pan from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.options.canvas.getMousePosition(event);
    const worldPoint = this.options.onScreenToWorld(point);
    
    // Clamp the final point to image bounds
    const clampedPoint = this.options.onClampPointToImageBounds(worldPoint);
    
    const annotation = this.options.currentTool.finishDrawing(clampedPoint);
    
    if (annotation) {
      // Check if annotation meets minimum size requirements
      if (this.options.onMeetsMinimumSize(annotation)) {
        // Annotation is large enough, create it
        if (this.options.onAnnotationCreate) {
          this.options.onAnnotationCreate(annotation);
        }
        
        // Select the newly created annotation
        if (this.options.annotationManager) {
          this.options.annotationManager.selectAnnotation(annotation);
        }
      } else {
        // Annotation is too small, cancel it
      }
    }
  }

  /**
   * Handle mouse leave event
   */
  private handleMouseLeave(event: MouseEvent): void {
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

    // Delete selected annotation
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.options.annotationManager && this.options.annotationManager.selectedAnnotation) {
        this.options.annotationManager.removeAnnotation(this.options.annotationManager.selectedAnnotation.id);
        event.preventDefault();
        return;
      }
    }

    // Escape key cancels current drawing or deactivates tool
    if (event.key === 'Escape') {
      if (this.options.currentTool && this.options.toolManagerDrawing) {
        this.options.currentTool.cancelDrawing();
      } else if (this.options.activeToolType) {
        this.options.onDeactivateTool();
      } else if (this.options.annotationManager) {
        // Clear selection if no tool is active
        this.options.annotationManager.selectAnnotation(null);
      }
      return;
    }

    // Tool shortcuts (Alt + key) - toggle tool on/off
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
    // Remove event listeners using bound handlers - match capture phase
    this.options.canvas.removeEventListener('mousedown', this.boundMouseDown as EventListener, true);
    this.options.canvas.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    this.options.canvas.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    this.options.canvas.removeEventListener('mouseleave', this.boundMouseLeave as EventListener);
    
    // Remove document event listeners
    document.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    document.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    
    // Remove document event listeners
    document.removeEventListener('keydown', this.boundKeyDown, true);

    // Remove custom event listener
    this.options.canvas.getElement().removeEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);
  }
}
