import { Renderer } from '../../../core/Renderer';
import type { Annotation, AnnotationStyle, ControllerOptions, EventHandlerOptions, Point, Tool, ToolManagerOptions } from '../../../types';
import { AnnotationRenderer } from '../Renderer';
import { AnnotationToolsController } from './Controller';
import { AnnotationToolsEventHandler } from './EventHandler';
import { AnnotationToolsUtils } from './Utils';

export class AnnotationToolsManager {
  private eventHandler: AnnotationToolsEventHandler;
  private controller: AnnotationToolsController;
  private utils: AnnotationToolsUtils;
  private onAnnotationCreate?: (annotation: Annotation) => void;
  private toolManagerDrawing = false; // Track if we're currently drawing

  constructor(
    canvas: Renderer,
    renderer: AnnotationRenderer,
    options: ToolManagerOptions
  ) {
    this.utils = new AnnotationToolsUtils(canvas);

    const controllerOptions: ControllerOptions = {
      canvas,
      renderer,
      defaultStyle: options.defaultStyle,
      availableTools: options.availableTools,
      ...(options.annotationManager && typeof options.annotationManager === 'object' ? { annotationManager: options.annotationManager } : {})
    };
    this.controller = new AnnotationToolsController(controllerOptions);

    const eventHandlerOptions: EventHandlerOptions = {
      canvas,
      renderer,
      currentTool: this.controller.getCurrentTool(),
      activeToolType: this.controller.getActiveToolType(),
      toolActivatedByKeyboard: this.controller.getToolActivatedByKeyboard(),
      toolManagerDrawing: this.toolManagerDrawing,
      ...(options.annotationManager && typeof options.annotationManager === 'object' ? { annotationManager: options.annotationManager } : {}),
      onActivateTool: (toolType: string) => {
        const result = this.controller.activateTool(toolType);
        this.controller.setToolActivatedByKeyboard(true);
        // Update options synchronously to ensure flag is set immediately
        // This is critical for the first click to work properly
        this.updateEventHandlerOptions();
        return result;
      },
      onDeactivateTool: () => {
        this.controller.deactivateTool();
        this.updateEventHandlerOptions();
      },
      onScreenToWorld: (screenPoint: Point) => this.utils.screenToWorld(screenPoint),
      onIsPointInImageBounds: (point: Point) => this.utils.isPointInImageBounds(point),
      onMeetsMinimumSize: (annotation: Annotation) => this.utils.meetsMinimumSize(annotation, this.controller.getActiveToolType()),
      onClampPointToImageBounds: (point: Point) => this.utils.clampPointToImageBounds(point)
    };

    if (this.onAnnotationCreate) {
      eventHandlerOptions.onAnnotationCreate = this.onAnnotationCreate;
    }
    this.eventHandler = new AnnotationToolsEventHandler(eventHandlerOptions);

    this.eventHandler.setupEventListeners();
  }

  /**
   * Update event handler options when internal state changes
   */
  private updateEventHandlerOptions(): void {
    const updateOptions: Partial<EventHandlerOptions> = {
      currentTool: this.controller.getCurrentTool(),
      activeToolType: this.controller.getActiveToolType(),
      toolActivatedByKeyboard: this.controller.getToolActivatedByKeyboard(),
      toolManagerDrawing: this.toolManagerDrawing
    };

    if (this.onAnnotationCreate) {
      updateOptions.onAnnotationCreate = this.onAnnotationCreate;
    }

    this.eventHandler.updateOptions(updateOptions);
  }

  /**
   * Activate a tool
   */
  activateTool(toolType: string): boolean {
    const result = this.controller.activateTool(toolType);
    if (result) {
      // Set flag to allow drawing immediately after activation
      // This is critical for programmatic tool activation (not just keyboard shortcuts)
      this.controller.setToolActivatedByKeyboard(true);
      // Update event handler options synchronously to ensure flag is set immediately
      // This is critical for the first click to work properly
      this.updateEventHandlerOptions();
    }
    return result;
  }

  /**
   * Deactivate current tool
   */
  deactivateTool(): void {
    this.controller.deactivateTool();
    // Update event handler options to ensure flag is reset and drawing is disabled
    this.updateEventHandlerOptions();
  }

  /**
   * Select a tool by type (legacy method for backward compatibility)
   */
  selectTool(toolType: string): boolean {
    return this.controller.selectTool(toolType);
  }

  /**
   * Get current tool
   */
  getCurrentTool() {
    return this.controller.getCurrentTool();
  }

  /**
   * Get current tool type
   */
  getCurrentToolType(): string | null {
    return this.controller.getCurrentToolType();
  }

  /**
   * Get active tool type (for UI highlighting)
   */
  getActiveToolType(): string | null {
    return this.controller.getActiveToolType();
  }


  /**
   * Update tool style
   */
  updateToolStyle(style: Partial<AnnotationStyle>): void {
    this.controller.updateToolStyle(style);
  }

  /**
   * Get available tools
   */
  getAvailableTools(): Tool[] {
    return this.controller.getAvailableTools();
  }

  /**
   * Set annotation create callback
   */
  setOnAnnotationCreate(callback: (annotation: Annotation) => void): void {
    this.onAnnotationCreate = callback;
    this.updateEventHandlerOptions();
  }

  /**
   * Render current drawing preview
   */
  renderPreview(): void {
    this.controller.renderPreview();
  }

  /**
   * Check if currently drawing
   */
  isDrawing(): boolean {
    return this.controller.isDrawing();
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
    return this.controller.isToolActive();
  }

  /**
   * Cancel current drawing
   */
  cancelCurrentDrawing(): void {
    this.controller.cancelCurrentDrawing();
  }

  /**
   * Get current tool configuration
   */
  getToolConfig(): { rect: boolean; arrow: boolean; text: boolean; circle: boolean; line: boolean } {
    return this.controller.getToolConfig();
  }

  /**
   * Update tool configuration
   */
  updateToolConfig(annotationConfig: Record<string, unknown>): void {
    this.controller.updateToolConfig(annotationConfig);
  }

  /**
   * Destroy tool manager and clean up
   */
  destroy(): void {
    this.eventHandler.destroy();
    this.controller.destroy();
  }
}