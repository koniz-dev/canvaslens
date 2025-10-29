import type { Annotation, Point } from '../../../../types';
import { worldToScreen } from '../../../../utils/geometry/coordinate';
import { BaseTool } from './BaseTool';

export class TextTool extends BaseTool {
  private textInput: HTMLInputElement | null = null;
  private timeoutIds: ReturnType<typeof setTimeout>[] = [];
  private blurTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isSettingUp = false; // Flag to prevent blur during setup

  /**
   * Start drawing text (show input dialog)
   */
  startDrawing(point: Point): Annotation | null {
    this.isDrawing = true;
    this.startPoint = { ...point };
    this.showTextInput(point);
    return null; // Text tool doesn't create annotation immediately
  }

  /**
   * Continue drawing - not applicable for text tool
   */
  continueDrawing(_point: Point): void {
    // Text tool doesn't have continuous drawing
  }

  /**
   * Finish drawing - handled by text input
   */
  finishDrawing(_point: Point): Annotation | null {
    // This is handled by the text input completion
    return null;
  }

  /**
   * Show text input dialog
   */
  private showTextInput(point: Point): void {
    // Clear any existing blur timeout
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId);
      this.blurTimeoutId = null;
    }

    // Set flag to prevent blur during setup
    this.isSettingUp = true;

    // Convert world coordinates to screen coordinates for positioning
    const viewState = this.canvas.getViewState();
    const screenPoint = worldToScreen(point, viewState);

    // Create text input element
    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.placeholder = 'Enter text...';
    this.textInput.setAttribute('aria-label', 'Enter annotation text');
    this.textInput.style.position = 'absolute';
    this.textInput.style.left = `${screenPoint.x}px`;
    this.textInput.style.top = `${screenPoint.y}px`;
    this.textInput.style.zIndex = '1000';
    this.textInput.style.padding = '4px 8px';
    this.textInput.style.border = '2px solid #007bff';
    this.textInput.style.borderRadius = '4px';
    this.textInput.style.fontSize = `${this.options.style?.fontSize || 16}px`;
    this.textInput.style.fontFamily = this.options.style?.fontFamily || 'Arial, sans-serif';
    this.textInput.style.backgroundColor = 'white';
    this.textInput.style.color = this.options.style?.strokeColor || '#000000';
    this.textInput.style.minWidth = '100px';

    // Add to canvas container
    const canvasElement = this.canvas.getElement();
    const container = canvasElement.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.appendChild(this.textInput);
    }

    // Handle input events - add BEFORE focus to prevent blur issues
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        this.completeTextInput();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.cancelTextInput();
      }
    });

    // Only complete on blur if we're not in setup phase
    this.textInput.addEventListener('blur', () => {
      // Ignore blur if we're still setting up
      if (this.isSettingUp) {
        return;
      }

      // Clear any existing blur timeout
      if (this.blurTimeoutId) {
        clearTimeout(this.blurTimeoutId);
      }
      // Delay to allow for click events and prevent conflicts
      this.blurTimeoutId = setTimeout(() => {
        if (this.textInput && !this.isSettingUp) {
          this.completeTextInput();
        }
        this.blurTimeoutId = null;
      }, 200);
    });

    // Prevent text input from being removed when clicking on it
    this.textInput.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    });

    this.textInput.addEventListener('click', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    });

    // Prevent blur when clicking inside the input
    this.textInput.addEventListener('mouseup', (e) => {
      e.stopPropagation();
    });

    // Focus after a delay to ensure setup is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.textInput) {
          this.textInput.focus();
          this.textInput.select();
          // Clear setup flag after focus is complete
          setTimeout(() => {
            this.isSettingUp = false;
          }, 100);
        }
      });
    });
  }

  /**
   * Complete text input and create annotation
   */
  private completeTextInput(): void {
    if (!this.textInput) return;

    const text = this.textInput.value.trim();
    let annotation: Annotation | null = null;

    if (text && this.startPoint) {
      annotation = this.createAnnotation(
        [this.startPoint],
        { text }
      );
    }

    // Clean up
    this.removeTextInput();

    // Reset drawing state but keep tool active for next text input
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;

    // Trigger annotation creation if we have a valid annotation
    if (annotation) {
      // We need to notify the tool manager about the new annotation
      // This will be handled by the tool manager's event system
      const timeoutId = setTimeout(() => {
        // Trigger a custom event or use a callback mechanism
        const event = new CustomEvent('annotationCreated', { detail: annotation });
        this.canvas.getElement().dispatchEvent(event);
      }, 0);
      this.timeoutIds.push(timeoutId);
    }
  }

  /**
   * Cancel text input
   */
  private cancelTextInput(): void {
    this.removeTextInput();
    // Don't call cancelDrawing() here to avoid infinite loop
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;
  }

  /**
   * Remove text input element
   */
  private removeTextInput(): void {
    // Clear blur timeout if it exists
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId);
      this.blurTimeoutId = null;
    }

    // Reset setup flag
    this.isSettingUp = false;

    if (this.textInput && this.textInput.parentElement) {
      this.textInput.parentElement.removeChild(this.textInput);
    }
    this.textInput = null;
  }

  /**
   * Get current preview points for rendering
   */
  getPreviewPoints(): Point[] {
    return []; // Text tool doesn't have preview
  }

  /**
   * Get tool type
   */
  getType(): Annotation['type'] {
    return 'text';
  }

  /**
   * Cancel current text input if active
   */
  cancelDrawing(): void {
    super.cancelDrawing();
    if (this.textInput) {
      this.cancelTextInput();
    }
  }

  /**
   * Clean up resources and timers
   */
  destroy(): void {
    // Clear all pending timeouts
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];

    // Clear blur timeout
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId);
      this.blurTimeoutId = null;
    }

    // Remove text input if it exists
    if (this.textInput && this.textInput.parentNode) {
      this.textInput.parentNode.removeChild(this.textInput);
      this.textInput = null;
    }
  }
}
