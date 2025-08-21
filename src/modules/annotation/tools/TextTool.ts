import { Point, Annotation } from '../../../types';
import { BaseTool } from './BaseTool';

export class TextTool extends BaseTool {
  private textInput: HTMLInputElement | null = null;
  private pendingAnnotation: { point: Point; resolve: (annotation: Annotation | null) => void } | null = null;

  /**
   * Start drawing text (show input dialog)
   */
  startDrawing(point: Point): void {
    this.showTextInput(point);
  }

  /**
   * Continue drawing - not applicable for text tool
   */
  continueDrawing(point: Point): void {
    // Text tool doesn't have continuous drawing
  }

  /**
   * Finish drawing - handled by text input
   */
  finishDrawing(point: Point): Annotation | null {
    // This is handled by the text input completion
    return null;
  }

  /**
   * Show text input dialog
   */
  private showTextInput(point: Point): Promise<Annotation | null> {
    return new Promise((resolve) => {
      this.pendingAnnotation = { point, resolve };
      
      // Create text input element
      this.textInput = document.createElement('input');
      this.textInput.type = 'text';
      this.textInput.placeholder = 'Enter text...';
      this.textInput.style.position = 'absolute';
      this.textInput.style.left = `${point.x}px`;
      this.textInput.style.top = `${point.y}px`;
      this.textInput.style.zIndex = '1000';
      this.textInput.style.padding = '4px 8px';
      this.textInput.style.border = '2px solid #007bff';
      this.textInput.style.borderRadius = '4px';
      this.textInput.style.fontSize = `${this.options.style.fontSize || 16}px`;
      this.textInput.style.fontFamily = this.options.style.fontFamily || 'Arial, sans-serif';
      this.textInput.style.backgroundColor = 'white';
      this.textInput.style.color = this.options.style.strokeColor;

      // Add to canvas container
      const canvasElement = this.canvas.getElement();
      const container = canvasElement.parentElement;
      if (container) {
        container.style.position = 'relative';
        container.appendChild(this.textInput);
      }

      // Focus and select
      this.textInput.focus();

      // Handle input events
      this.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.completeTextInput();
        } else if (e.key === 'Escape') {
          this.cancelTextInput();
        }
      });

      this.textInput.addEventListener('blur', () => {
        // Delay to allow for click events
        setTimeout(() => this.completeTextInput(), 100);
      });
    });
  }

  /**
   * Complete text input and create annotation
   */
  private completeTextInput(): void {
    if (!this.textInput || !this.pendingAnnotation) return;

    const text = this.textInput.value.trim();
    let annotation: Annotation | null = null;

    if (text) {
      annotation = this.createAnnotation(
        [this.pendingAnnotation.point],
        { text }
      );
    }

    // Clean up
    this.removeTextInput();
    this.pendingAnnotation.resolve(annotation);
    this.pendingAnnotation = null;
  }

  /**
   * Cancel text input
   */
  private cancelTextInput(): void {
    if (!this.pendingAnnotation) return;

    this.removeTextInput();
    this.pendingAnnotation.resolve(null);
    this.pendingAnnotation = null;
  }

  /**
   * Remove text input element
   */
  private removeTextInput(): void {
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
   * Create text annotation with async input
   */
  async createTextAnnotation(point: Point): Promise<Annotation | null> {
    return this.showTextInput(point);
  }

  /**
   * Cancel current text input if active
   */
  cancelDrawing(): void {
    super.cancelDrawing();
    if (this.pendingAnnotation) {
      this.cancelTextInput();
    }
  }
}
