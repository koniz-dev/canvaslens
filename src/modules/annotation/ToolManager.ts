import { Canvas } from '../../core/Canvas';
import { Annotation, AnnotationStyle, Tool, Point } from '../../types';
import { AnnotationRenderer } from './AnnotationRenderer';
import { BaseTool, RectangleTool, ArrowTool, TextTool, ToolOptions } from './tools';

export interface ToolManagerOptions {
  defaultStyle: AnnotationStyle;
  availableTools: Tool[];
}

export class ToolManager {
  private canvas: Canvas;
  private renderer: AnnotationRenderer;
  private options: ToolManagerOptions;
  private tools: Map<string, BaseTool> = new Map();
  private currentTool: BaseTool | null = null;
  private onAnnotationCreate?: (annotation: Annotation) => void;
  private toolManagerDrawing = false; // Track if we're currently drawing
  private isCtrlPressed = false;
  private isAltPressed = false;
  private drawingMode = false; // Track if we're in drawing mode (tool selected)
  
  // Store bound event handlers for proper cleanup
  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundMouseLeave: (event: MouseEvent) => void;
  private boundKeyDown: (event: KeyboardEvent) => void;
  private boundKeyUp: (event: KeyboardEvent) => void;

  constructor(
    canvas: Canvas,
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

    // Keyboard shortcuts - use window to ensure global capture
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    
    console.log('ToolManager: Keyboard event listeners setup on window');
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    console.log('ToolManager handleMouseDown called');
    console.log('Current tool:', this.currentTool?.getType());
    console.log('Mouse button:', event.button);
    console.log('Ctrl pressed:', this.isCtrlPressed);
    console.log('Event ctrlKey:', event.ctrlKey);
    
    if (!this.currentTool || event.button !== 0) {
      console.log('Exiting: no tool or wrong button');
      return; // Only left mouse button
    }
    
    // Start drawing if Ctrl is pressed OR if we're in drawing mode
    if (!event.ctrlKey && !this.drawingMode) {
      console.log('Exiting: Ctrl not pressed and not in drawing mode');
      return;
    }

    console.log('Starting drawing...');
    // Stop all event propagation immediately to prevent zoom/pan from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    console.log('Mouse point:', point);
    console.log('World point:', worldPoint);
    
    this.currentTool.startDrawing(worldPoint);
    this.toolManagerDrawing = true;
    console.log('Drawing started successfully');
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
    
    this.currentTool.continueDrawing(worldPoint);
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
    
    const annotation = this.currentTool.finishDrawing(worldPoint);
    
    if (annotation && this.onAnnotationCreate) {
      this.onAnnotationCreate(annotation);
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

    // Escape key cancels current drawing or exits drawing mode
    if (event.key === 'Escape') {
      if (this.currentTool && this.toolManagerDrawing) {
        this.currentTool.cancelDrawing();
        this.toolManagerDrawing = false;
        console.log('Drawing cancelled');
      } else if (this.drawingMode) {
        this.drawingMode = false;
        console.log('Drawing mode disabled');
      }
    }

    // Tool shortcuts (Alt + key)
    if (event.altKey) {
      console.log('Alt key pressed with:', event.key);
      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          console.log('Selecting rectangle tool');
          this.selectTool('rect');
          // Trigger UI update by calling the global selectTool function
          if ((window as any).selectTool) {
            (window as any).selectTool('rect');
          }
          break;
        case 'a':
          event.preventDefault();
          console.log('Selecting arrow tool');
          this.selectTool('arrow');
          if ((window as any).selectTool) {
            (window as any).selectTool('arrow');
          }
          break;
        case 't':
          event.preventDefault();
          console.log('Selecting text tool');
          this.selectTool('text');
          if ((window as any).selectTool) {
            (window as any).selectTool('text');
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
   * Select a tool by type
   */
  selectTool(toolType: string): boolean {
    console.log('selectTool called with:', toolType);
    const tool = this.tools.get(toolType);
    if (!tool) {
      console.log('Tool not found:', toolType);
      return false;
    }

    // Cancel current drawing if switching tools
    if (this.currentTool && this.currentTool !== tool) {
      this.currentTool.cancelDrawing();
    }

    this.currentTool = tool;
    this.drawingMode = true; // Enable drawing mode when tool is selected
    console.log('Tool selected successfully:', toolType);
    console.log('Drawing mode enabled');
    return true;
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
   * Cancel current drawing
   */
  cancelCurrentDrawing(): void {
    if (this.currentTool) {
      this.currentTool.cancelDrawing();
    }
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
    
    // Remove window event listeners
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);

    // Remove custom event listener
    this.canvas.getElement().removeEventListener('annotationCreated', this.handleAnnotationCreated.bind(this) as EventListener);

    // Cancel any active drawing
    this.cancelCurrentDrawing();

    // Clear tools
    this.tools.clear();
    this.currentTool = null;
  }
}
