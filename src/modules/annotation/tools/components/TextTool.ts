import type { Annotation, Point } from '../../../../types';
import { worldToScreen } from '../../../../utils/geometry/coordinate';
import { TextSanitizer } from '../../../../utils/security/text-sanitizer';
import { BaseTool } from './BaseTool';

/**
 * Text annotation tool.
 *
 * Flow on a click:
 * 1. Mousedown spawns an HTML <input> positioned at the click point and
 *    focuses it synchronously so the user can start typing immediately.
 * 2. Enter commits the text as an annotation and removes the input.
 * 3. Escape cancels without saving.
 * 4. Clicking outside (blur) commits when there is text, otherwise cancels.
 *
 * Multiple text annotations can be created in sequence — each click spawns
 * a fresh input. The previous input (if any) is committed first.
 */
export class TextTool extends BaseTool {
  private textInput: HTMLInputElement | null = null;
  private currentStart: Point | null = null;
  private committed = false;

  startDrawing(point: Point): Annotation | null {
    // If a previous input is still open, commit it before starting a new one
    // so click-to-add-multiple-texts works.
    if (this.textInput) this.completeTextInput();

    this.isDrawing = true;
    this.startPoint = { ...point };
    this.currentStart = { ...point };
    this.showTextInput(point);
    return null;
  }

  continueDrawing(_point: Point): void {
    /* text tool has no continuous drawing */
  }

  finishDrawing(_point: Point): Annotation | null {
    return null;
  }

  cancelDrawing(): void {
    super.cancelDrawing();
    this.removeTextInput();
    this.currentStart = null;
  }

  destroy(): void {
    this.removeTextInput();
    this.currentStart = null;
  }

  getPreviewPoints(): Point[] {
    return [];
  }

  getType(): Annotation['type'] {
    return 'text';
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  private showTextInput(point: Point): void {
    const viewState = this.canvas.getViewState();
    const screen = worldToScreen(point, viewState);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter text…';
    input.setAttribute('aria-label', 'Enter annotation text');
    const fontSize = this.options.style?.fontSize ?? 20;
    const fontFamily = this.options.style?.fontFamily ?? 'Arial, sans-serif';
    input.style.cssText = `
      position: absolute;
      left: ${screen.x}px;
      top: ${screen.y - fontSize}px;
      z-index: 1000;
      padding: 4px 8px;
      border: 2px solid #007bff;
      border-radius: 4px;
      background-color: white;
      color: ${this.options.style?.strokeColor ?? '#000'};
      font-size: ${fontSize}px;
      font-family: ${fontFamily};
      min-width: 100px;
      outline: none;
    `;

    // Keep clicks INSIDE the input from bubbling to the canvas (which would
    // otherwise be interpreted by the canvas's other listeners).
    const stop = (e: Event) => e.stopPropagation();
    input.addEventListener('mousedown', stop);
    input.addEventListener('mouseup', stop);
    input.addEventListener('click', stop);
    input.addEventListener('pointerdown', stop);

    input.addEventListener('keydown', (e) => {
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

    // Commit on blur — keeps the user's typed text if they click away.
    input.addEventListener('blur', () => {
      // Defer one frame so a re-focus (e.g. switching app windows) doesn't
      // immediately destroy the input.
      requestAnimationFrame(() => {
        if (this.textInput === input) this.completeTextInput();
      });
    });

    const canvasElement = this.canvas.getElement();
    const container = canvasElement.parentElement;
    if (!container) {
      // No container to mount into — abort gracefully.
      return;
    }
    container.style.position = container.style.position || 'relative';
    container.appendChild(input);

    this.textInput = input;
    this.committed = false;

    // Focus on the next microtask so the focus call wins the race against
    // the browser's own click-to-focus retargeting for the still-bubbling
    // mousedown that opened this input.
    Promise.resolve().then(() => {
      if (this.textInput === input) input.focus();
    });
  }

  private completeTextInput(): void {
    if (!this.textInput || this.committed) return;
    this.committed = true;

    const raw = this.textInput.value.trim();
    const text = TextSanitizer.sanitize(raw);
    const start = this.currentStart;

    this.removeTextInput();
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;
    this.currentStart = null;

    if (text && start) {
      const annotation = this.createAnnotation([start], { text });
      // Notify the EventHandler via a CustomEvent on the canvas so the
      // ToolManager / AnnotationManager pipeline picks it up.
      this.canvas
        .getElement()
        .dispatchEvent(new CustomEvent('annotationCreated', { detail: annotation }));
    }
  }

  private cancelTextInput(): void {
    if (!this.textInput) return;
    this.committed = true; // suppress blur-driven completion
    this.removeTextInput();
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;
    this.currentStart = null;
  }

  private removeTextInput(): void {
    if (this.textInput?.parentElement) {
      this.textInput.parentElement.removeChild(this.textInput);
    }
    this.textInput = null;
  }
}
