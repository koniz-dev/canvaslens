import { Renderer } from '../../core/Renderer';
import { Annotation, AnnotationStyle, Tool, Point } from '../../types';
import { AnnotationRenderer } from './AnnotationRenderer';
import { BaseTool, RectangleTool, ArrowTool, TextTool, CircleTool, LineTool, ToolOptions } from './tools';

export interface ToolManagerOptions {
  defaultStyle: AnnotationStyle;
  availableTools: Tool[];
  annotationManager?: any; // Reference to AnnotationManager for keyboard shortcuts
}

export class ToolManager {
  private canvas: Renderer;
  private renderer: AnnotationRenderer;
  private options: ToolManagerOptions;
  private tools: Map<string, BaseTool> = new Map();
  private currentTool: BaseTool | null = null;
  private onAnnotationCreate?: (annotation: Annotation) => void;
  private toolManagerDrawing = false; // Track if we're currently drawing
  private isCtrlPressed = false;
  private isAltPressed = false;
  private activeToolType: string | null = null; // Track which tool is currently active
  private toolActivatedByKeyboard = false; // Track if tool was activated by Alt+R/A/T/C/L
  private onToolChange?: (toolType: string | null) => void; // Callback for UI updates
  
  // Minimum size thresholds for annotations (in pixels)
  private static readonly MIN_SIZE_THRESHOLDS = {
    rect: 10,    // Minimum 10px width or height
    circle: 10,  // Minimum 10px radius
    line: 8,     // Minimum 8px length
    arrow: 8,    // Minimum 8px length
    text: 0      // Text doesn't have size constraint
  };
  
  // Store bound event handlers for proper cleanup
  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundMouseLeave: (event: MouseEvent) => void;
  private boundKeyDown: (event: KeyboardEvent) => void;
  private boundKeyUp: (event: KeyboardEvent) => void;

  constructor(
    canvas: Renderer,
    renderer: AnnotationRenderer,
    options: ToolManagerOptions
  ) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.options = options;

    // Bind event handlers to preserve context
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundMouseLeave = this.handleMouseLeave.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);

    this.initializeTools();
    this.setupEventListeners();
  }

  /**
   * Initialize all available tools
   */
  private initializeTools(): void {
    const toolOptions: ToolOptions = {
      style: this.options.defaultStyle
    };

    // Create tool instances
    this.tools.set('rect', new RectangleTool(this.canvas, this.renderer, toolOptions));
    this.tools.set('arrow', new ArrowTool(this.canvas, this.renderer, toolOptions));
    this.tools.set('text', new TextTool(this.canvas, this.renderer, toolOptions));
    this.tools.set('circle', new CircleTool(this.canvas, this.renderer, toolOptions));
    this.tools.set('line', new LineTool(this.canvas, this.renderer, toolOptions));

    // Set default tool to rectangle
    this.currentTool = this.tools.get('rect') || null;
  }

  /**
   * Setup event listeners for drawing interactions
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.boundMouseDown as EventListener);
    this.canvas.addEventListener('mousemove', this.boundMouseMove as EventListener);
    this.canvas.addEventListener('mouseup', this.boundMouseUp as EventListener);
    this.canvas.addEventListener('mouseleave', this.boundMouseLeave as EventListener);

    // Also add to document to catch mouse events outside canvas
    document.addEventListener('mousemove', this.boundMouseMove as EventListener);
    document.addEventListener('mouseup', this.boundMouseUp as EventListener);

    // Listen for custom annotation creation events (from TextTool)
    this.canvas.getElement().addEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);

    // Keyboard shortcuts - use document with capture to ensure we get events first
    document.addEventListener('keydown', this.boundKeyDown, true);
    document.addEventListener('keyup', this.boundKeyUp, true);
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.currentTool || event.button !== 0) {
      return; // Only left mouse button
    }
    
    // Start drawing if tool is active
    if (!this.activeToolType) {
      return; // No active tool
    }

    // Check if tool was activated by keyboard shortcut
    // If activated by Alt+shortcut, allow direct drawing (no Ctrl required)
    // If activated by button click, require Ctrl+Click
    if (!this.toolActivatedByKeyboard && !event.ctrlKey) {
      return; // Need Ctrl+Click to draw when tool was activated by button
    }

    // Stop all event propagation immediately to prevent zoom/pan from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    // Check if the point is within image bounds
    if (!this.isPointInImageBounds(worldPoint)) {
      return; // Don't start drawing outside image bounds
    }
    
    const annotation = this.currentTool.startDrawing(worldPoint);
    this.toolManagerDrawing = true;
    
    // Clear any existing selection when starting new drawing
    if (this.canvas.annotationManager) {
      (this.canvas.annotationManager as any).selectAnnotation(null);
    }
    
    // If annotation was created immediately, add it to the manager
    if (annotation) {
      // Check if annotation meets minimum size requirements
      if (this.meetsMinimumSize(annotation)) {
        // Annotation is large enough, create it
        if (this.onAnnotationCreate) {
          this.onAnnotationCreate(annotation);
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
    if (!this.currentTool || !this.currentTool.isCurrentlyDrawing()) return;

    // Stop all event propagation immediately to prevent zoom/pan from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    // Clamp the point to image bounds if outside
    const clampedPoint = this.clampPointToImageBounds(worldPoint);
    
    this.currentTool.continueDrawing(clampedPoint);
    
    // Trigger re-render to show updated annotation
    this.canvas.getElement().dispatchEvent(new CustomEvent('viewStateChange'));
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.currentTool || !this.currentTool.isCurrentlyDrawing()) return;

    // Stop all event propagation immediately to prevent zoom/pan from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    // Clamp the final point to image bounds
    const clampedPoint = this.clampPointToImageBounds(worldPoint);
    
    const annotation = this.currentTool.finishDrawing(clampedPoint);
    
    if (annotation) {
      // Check if annotation meets minimum size requirements
      if (this.meetsMinimumSize(annotation)) {
        // Annotation is large enough, create it
        if (this.onAnnotationCreate) {
          this.onAnnotationCreate(annotation);
        }
        
        // Select the newly created annotation
        if (this.options.annotationManager) {
          this.options.annotationManager.selectAnnotation(annotation);
        }
      } else {
        // Annotation is too small, cancel it
      }
    }
    
    this.toolManagerDrawing = false;
  }

  /**
   * Handle mouse leave event
   */
  private handleMouseLeave(event: MouseEvent): void {
    if (!this.currentTool) return;
    
    this.currentTool.cancelDrawing();
    this.toolManagerDrawing = false;
  }

  /**
   * Handle custom annotation created event (from TextTool)
   */
  private handleAnnotationCreated(event: CustomEvent): void {
    const annotation = event.detail;
    if (annotation && this.onAnnotationCreate) {
      this.onAnnotationCreate(annotation);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Track modifier keys
    if (event.key === 'Control') {
      this.isCtrlPressed = true;
    }
    if (event.key === 'Alt') {
      this.isAltPressed = true;
    }

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
      if (this.currentTool && this.toolManagerDrawing) {
        this.currentTool.cancelDrawing();
        this.toolManagerDrawing = false;
      } else if (this.activeToolType) {
        this.deactivateTool();
      } else if (this.options.annotationManager) {
        // Clear selection if no tool is active
        this.options.annotationManager.selectAnnotation(null);
      }
      return;
    }

    // Tool shortcuts (Alt + key) - toggle tool on/off
    if (event.altKey) {
      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          if (this.activeToolType === 'rect') {
            this.deactivateTool();
          } else {
            this.activateTool('rect');
            this.toolActivatedByKeyboard = true; // Mark as activated by keyboard
          }
          break;
        case 'a':
          event.preventDefault();
          if (this.activeToolType === 'arrow') {
            this.deactivateTool();
          } else {
            this.activateTool('arrow');
            this.toolActivatedByKeyboard = true; // Mark as activated by keyboard
          }
          break;
        case 't':
          event.preventDefault();
          if (this.activeToolType === 'text') {
            this.deactivateTool();
          } else {
            this.activateTool('text');
            this.toolActivatedByKeyboard = true; // Mark as activated by keyboard
          }
          break;
        case 'c':
          event.preventDefault();
          if (this.activeToolType === 'circle') {
            this.deactivateTool();
          } else {
            this.activateTool('circle');
            this.toolActivatedByKeyboard = true; // Mark as activated by keyboard
          }
          break;
        case 'l':
          event.preventDefault();
          if (this.activeToolType === 'line') {
            this.deactivateTool();
          } else {
            this.activateTool('line');
            this.toolActivatedByKeyboard = true; // Mark as activated by keyboard
          }
          break;
      }
    }
  }

  /**
   * Handle keyboard up events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Track modifier keys
    if (event.key === 'Control') {
      this.isCtrlPressed = false;
    }
    if (event.key === 'Alt') {
      this.isAltPressed = false;
    }
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  private screenToWorld(screenPoint: Point): Point {
    const viewState = this.canvas.getViewState();
    return {
      x: (screenPoint.x - viewState.offsetX) / viewState.scale,
      y: (screenPoint.y - viewState.offsetY) / viewState.scale
    };
  }

  /**
   * Get image bounds from the canvas (through annotation manager)
   */
  private getImageBounds(): { x: number; y: number; width: number; height: number } | null {
    // Get image bounds from canvas annotation manager
    if (this.canvas.annotationManager) {
      return this.canvas.annotationManager.getImageBounds();
    }
    return null;
  }

  /**
   * Check if a point is within image bounds
   */
  private isPointInImageBounds(point: Point): boolean {
    const bounds = this.getImageBounds();
    if (!bounds) {
      return true; // If no image bounds, allow drawing anywhere
    }
    
    return point.x >= bounds.x && 
           point.x <= bounds.x + bounds.width &&
           point.y >= bounds.y && 
           point.y <= bounds.y + bounds.height;
  }

  /**
   * Check if annotation meets minimum size requirements
   */
  private meetsMinimumSize(annotation: Annotation): boolean {
    if (!this.activeToolType) return true;
    
    const minSize = ToolManager.MIN_SIZE_THRESHOLDS[this.activeToolType as keyof typeof ToolManager.MIN_SIZE_THRESHOLDS];
    if (minSize === undefined || minSize === 0) return true; // No size constraint
    
    switch (annotation.type) {
      case 'rect':
        if (annotation.points.length < 2) return false;
        const start = annotation.points[0]!;
        const end = annotation.points[1]!;
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        return width >= minSize || height >= minSize;
        
      case 'circle':
        if (annotation.points.length < 2) return false;
        const center = annotation.points[0]!;
        const edge = annotation.points[1]!;
        const radius = Math.sqrt(
          Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
        );
        return radius >= minSize;
        
      case 'line':
      case 'arrow':
        if (annotation.points.length < 2) return false;
        const lineStart = annotation.points[0]!;
        const lineEnd = annotation.points[annotation.points.length - 1]!;
        const length = Math.sqrt(
          Math.pow(lineEnd.x - lineStart.x, 2) + Math.pow(lineEnd.y - lineStart.y, 2)
        );
        return length >= minSize;
        
      case 'text':
        return true; // Text doesn't have size constraint
        
      default:
        return true;
    }
  }

  /**
   * Clamp a point to image bounds
   */
  private clampPointToImageBounds(point: Point): Point {
    const bounds = this.getImageBounds();
    if (!bounds) {
      return point; // If no image bounds, return original point
    }
    
    return {
      x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
      y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
    };
  }

  /**
   * Activate a tool (click on tool button)
   */
  activateTool(toolType: string): boolean {
    const tool = this.tools.get(toolType);
    if (!tool) {
      return false;
    }

    // For now, allow all tools to be activated
    // Tool availability is controlled by the UI configuration

    // Cancel current drawing if switching tools
    if (this.currentTool && this.currentTool !== tool) {
      this.currentTool.cancelDrawing();
    }

    this.currentTool = tool;
    this.activeToolType = toolType;
    this.toolActivatedByKeyboard = false; // Reset flag when activated by UI
    
    // Notify UI about tool change
    if (this.onToolChange) {
      this.onToolChange(toolType);
    }
    
    return true;
  }

  /**
   * Deactivate current tool
   */
  deactivateTool(): void {
    // Cancel current drawing
    if (this.currentTool) {
      this.currentTool.cancelDrawing();
    }
    
    this.currentTool = null;
    this.activeToolType = null;
    this.toolActivatedByKeyboard = false; // Reset flag
    
    // Notify UI about tool change
    if (this.onToolChange) {
      this.onToolChange(null);
    }
  }

  /**
   * Select a tool by type (legacy method for backward compatibility)
   */
  selectTool(toolType: string): boolean {
    return this.activateTool(toolType);
  }

  /**
   * Get current tool
   */
  getCurrentTool(): BaseTool | null {
    return this.currentTool;
  }

  /**
   * Get current tool type
   */
  getCurrentToolType(): string | null {
    return this.currentTool?.getType() || null;
  }

  /**
   * Get active tool type (for UI highlighting)
   */
  getActiveToolType(): string | null {
    return this.activeToolType;
  }

  /**
   * Set callback for tool change events
   */
  setOnToolChange(callback: (toolType: string | null) => void): void {
    this.onToolChange = callback;
  }

  /**
   * Update tool style
   */
  updateToolStyle(style: Partial<AnnotationStyle>): void {
    const newStyle = { ...this.options.defaultStyle, ...style };
    this.options.defaultStyle = newStyle;

    // Update all tools
    this.tools.forEach(tool => {
      tool.updateOptions({ style: newStyle });
    });
  }

  /**
   * Get available tools
   */
  getAvailableTools(): Tool[] {
    return this.options.availableTools;
  }

  /**
   * Set annotation create callback
   */
  setOnAnnotationCreate(callback: (annotation: Annotation) => void): void {
    this.onAnnotationCreate = callback;
  }

  /**
   * Render current drawing preview
   */
  renderPreview(): void {
    if (!this.currentTool || !this.currentTool.isCurrentlyDrawing()) return;

    const tool = this.currentTool as any;
    if (tool.getPreviewPoints) {
      const points = tool.getPreviewPoints();
      if (points.length > 0) {
        // Render preview (no need to apply view transform since points are in world coordinates)
        this.renderer.renderPreview(
          this.currentTool.getType(),
          points,
          this.options.defaultStyle
        );
      }
    }
  }

  /**
   * Check if currently drawing
   */
  isDrawing(): boolean {
    return this.currentTool?.isCurrentlyDrawing() || false;
  }

  /**
   * Check if tool manager is currently drawing
   */
  isToolManagerDrawing(): boolean {
    return this.toolManagerDrawing;
  }

  /**
   * Check if any tool is active
   */
  isToolActive(): boolean {
    return this.activeToolType !== null;
  }



  /**
   * Cancel current drawing
   */
  cancelCurrentDrawing(): void {
    if (this.currentTool) {
      this.currentTool.cancelDrawing();
    }
  }

  /**
   * Get current tool configuration
   */
  getToolConfig(): { rect: boolean; arrow: boolean; text: boolean; circle: boolean; line: boolean } {
    return {
      rect: this.tools.has('rect'),
      arrow: this.tools.has('arrow'),
      text: this.tools.has('text'),
      circle: this.tools.has('circle'),
      line: this.tools.has('line')
    };
  }

  /**
   * Destroy tool manager and clean up
   */
  destroy(): void {
    // Remove event listeners using bound handlers
    this.canvas.removeEventListener('mousedown', this.boundMouseDown as EventListener);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    this.canvas.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    this.canvas.removeEventListener('mouseleave', this.boundMouseLeave as EventListener);
    
    // Remove document event listeners
    document.removeEventListener('mousemove', this.boundMouseMove as EventListener);
    document.removeEventListener('mouseup', this.boundMouseUp as EventListener);
    
    // Remove document event listeners
    document.removeEventListener('keydown', this.boundKeyDown, true);
    document.removeEventListener('keyup', this.boundKeyUp, true);

    // Remove custom event listener
    this.canvas.getElement().removeEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);

    // Cancel any active drawing
    this.cancelCurrentDrawing();

    // Clear tools
    this.tools.clear();
    this.currentTool = null;
    this.activeToolType = null;
  }

  /**
   * Update tool configuration
   */
  updateToolConfig(annotationConfig: any): void {
    // Update tool availability based on configuration
    this.tools.forEach((tool, toolType) => {
      const isEnabled = annotationConfig[toolType];
      if (isEnabled === false) {
        // If tool is disabled and currently active, deactivate it
        if (this.activeToolType === toolType) {
          this.deactivateTool();
        }
      }
    });
  }
}
