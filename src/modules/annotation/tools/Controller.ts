import { Renderer } from '../../../core';
import { AnnotationStyle, Tool } from '../../../types';
import { AnnotationRenderer } from '../Renderer';
import { BaseTool, ToolOptions, RectangleTool, ArrowTool, TextTool, CircleTool, LineTool } from './components';

export interface ControllerOptions {
  canvas: Renderer;
  renderer: AnnotationRenderer;
  defaultStyle: AnnotationStyle;
  availableTools: Tool[];
  annotationManager?: any;
}

export class AnnotationToolsController {
  private options: ControllerOptions;
  private tools: Map<string, BaseTool> = new Map();
  private currentTool: BaseTool | null = null;
  private activeToolType: string | null = null;
  private toolActivatedByKeyboard = false;
  private onToolChange?: (toolType: string | null) => void;

  constructor(options: ControllerOptions) {
    this.options = options;
    this.initializeTools();
  }

  /**
   * Initialize all available tools
   */
  private initializeTools(): void {
    const toolOptions: ToolOptions = {
      style: this.options.defaultStyle
    };

    // Create tool instances
    this.tools.set('rect', new RectangleTool(this.options.canvas, this.options.renderer, toolOptions));
    this.tools.set('arrow', new ArrowTool(this.options.canvas, this.options.renderer, toolOptions));
    this.tools.set('text', new TextTool(this.options.canvas, this.options.renderer, toolOptions));
    this.tools.set('circle', new CircleTool(this.options.canvas, this.options.renderer, toolOptions));
    this.tools.set('line', new LineTool(this.options.canvas, this.options.renderer, toolOptions));

    // Set default tool to rectangle
    this.currentTool = this.tools.get('rect') || null;
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

  /**
   * Check if currently drawing
   */
  isDrawing(): boolean {
    return this.currentTool?.isCurrentlyDrawing() || false;
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
   * Render current drawing preview
   */
  renderPreview(): void {
    if (!this.currentTool || !this.currentTool.isCurrentlyDrawing()) return;

    const tool = this.currentTool as any;
    if (tool.getPreviewPoints) {
      const points = tool.getPreviewPoints();
      if (points.length > 0) {
        // Render preview (no need to apply view transform since points are in world coordinates)
        this.options.renderer.renderPreview(
          this.currentTool.getType(),
          points,
          this.options.defaultStyle
        );
      }
    }
  }

  /**
   * Get tool activated by keyboard flag
   */
  getToolActivatedByKeyboard(): boolean {
    return this.toolActivatedByKeyboard;
  }

  /**
   * Set tool activated by keyboard flag
   */
  setToolActivatedByKeyboard(activated: boolean): void {
    this.toolActivatedByKeyboard = activated;
  }

  /**
   * Destroy controller and clean up
   */
  destroy(): void {
    // Cancel any active drawing
    this.cancelCurrentDrawing();

    // Clear tools
    this.tools.clear();
    this.currentTool = null;
    this.activeToolType = null;
  }
}
