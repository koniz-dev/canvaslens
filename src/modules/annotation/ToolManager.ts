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

  constructor(
    canvas: Canvas,
    renderer: AnnotationRenderer,
    options: ToolManagerOptions
  ) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.options = options;

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
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener);
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener);
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this) as EventListener);

    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.currentTool || event.button !== 0) return; // Only left mouse button

    event.preventDefault();
    const point = this.canvas.getMousePosition(event);
    
    // Convert to world coordinates if needed
    const worldPoint = this.screenToWorld(point);
    
    this.currentTool.startDrawing(worldPoint);
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.currentTool || !this.currentTool.isCurrentlyDrawing()) return;

    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    this.currentTool.continueDrawing(worldPoint);
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.currentTool || !this.currentTool.isCurrentlyDrawing()) return;

    const point = this.canvas.getMousePosition(event);
    const worldPoint = this.screenToWorld(point);
    
    const annotation = this.currentTool.finishDrawing(worldPoint);
    
    if (annotation && this.onAnnotationCreate) {
      this.onAnnotationCreate(annotation);
    }
  }

  /**
   * Handle mouse leave event
   */
  private handleMouseLeave(event: MouseEvent): void {
    if (!this.currentTool) return;
    
    this.currentTool.cancelDrawing();
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Escape key cancels current drawing
    if (event.key === 'Escape' && this.currentTool) {
      this.currentTool.cancelDrawing();
    }

    // Tool shortcuts
    switch (event.key.toLowerCase()) {
      case 'r':
        if (event.ctrlKey || event.metaKey) return; // Don't interfere with browser shortcuts
        this.selectTool('rect');
        break;
      case 'a':
        if (event.ctrlKey || event.metaKey) return;
        this.selectTool('arrow');
        break;
      case 't':
        if (event.ctrlKey || event.metaKey) return;
        this.selectTool('text');
        break;
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
    const tool = this.tools.get(toolType);
    if (!tool) return false;

    // Cancel current drawing if switching tools
    if (this.currentTool && this.currentTool !== tool) {
      this.currentTool.cancelDrawing();
    }

    this.currentTool = tool;
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
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this) as EventListener);
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));

    // Cancel any active drawing
    this.cancelCurrentDrawing();

    // Clear tools
    this.tools.clear();
    this.currentTool = null;
  }
}
