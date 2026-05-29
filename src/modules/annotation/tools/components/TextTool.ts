import type { Annotation, Point } from '../../../../types';
import { TextSanitizer } from '../../../../utils/security/text-sanitizer';
import { BaseTool } from './BaseTool';

/**
 * Text annotation tool.
 *
 * Design notes (post-rewrite):
 *
 * - The input is appended to `document.body`, not the shadow root, and
 *   positioned with `position: fixed`. This sidesteps every shadow-DOM
 *   focus / positioning quirk we've hit and guarantees the input is
 *   visible regardless of how the host element is laid out.
 *
 * - All keystrokes on the input are stopped at the input's own capture
 *   phase. The library's document-level keydown handler (in
 *   AnnotationToolsEventHandler) registers in capture and would
 *   otherwise hijack Backspace / Escape / character keys.
 *
 * - No focus race: focus runs synchronously after the input is mounted.
 * - No auto-commit on blur. The user explicitly presses Enter to save
 *   or Escape to cancel, so the behaviour is predictable.
 */
export class TextTool extends BaseTool {
  private textInput: HTMLInputElement | null = null;
  private inputStartWorld: Point | null = null;
  private committed = false;

  startDrawing(point: Point): Annotation | null {
    // If a previous input is still open, commit it before starting a new
    // one so the click-then-click sequence creates two annotations.
    if (this.textInput) this.completeTextInput();

    this.isDrawing = true;
    this.startPoint = { ...point };
    this.inputStartWorld = { ...point };
    this.showTextInput(point);
    return null;
  }

  continueDrawing(_point: Point): void {
    /* no-op */
  }

  finishDrawing(_point: Point): Annotation | null {
    return null;
  }

  cancelDrawing(): void {
    super.cancelDrawing();
    this.removeTextInput();
    this.inputStartWorld = null;
  }

  destroy(): void {
    this.removeTextInput();
    this.inputStartWorld = null;
  }

  getPreviewPoints(): Point[] {
    return [];
  }

  getType(): Annotation['type'] {
    return 'text';
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  /**
   * Translate a world-space point into viewport coordinates that
   * `position: fixed` can use.
   */
  private worldToViewport(world: Point): { x: number; y: number } {
    const viewState = this.canvas.getViewState();
    const canvasRect = this.canvas.getElement().getBoundingClientRect();
    return {
      x: canvasRect.left + world.x * viewState.scale + viewState.offsetX,
      y: canvasRect.top + world.y * viewState.scale + viewState.offsetY
    };
  }

  private showTextInput(point: Point): void {
    const fontSize = this.options.style?.fontSize ?? 20;
    const fontFamily = this.options.style?.fontFamily ?? 'Arial, sans-serif';
    const strokeColor = this.options.style?.strokeColor ?? '#000';
    const viewport = this.worldToViewport(point);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter text…';
    input.setAttribute('aria-label', 'Enter annotation text');
    input.dataset.canvaslensTextInput = '1';
    input.style.cssText = `
      position: fixed;
      left: ${viewport.x}px;
      top: ${viewport.y - fontSize - 6}px;
      z-index: 2147483647;
      margin: 0;
      padding: 4px 8px;
      border: 2px solid #007bff;
      border-radius: 4px;
      background-color: white;
      color: ${strokeColor};
      font-size: ${fontSize}px;
      font-family: ${fontFamily};
      min-width: 120px;
      outline: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      pointer-events: auto;
    `;

    // Capture-phase listener on the input itself ensures keys are
    // handled here BEFORE the library's document-level handler can see
    // them. Otherwise Backspace would delete the selected annotation,
    // Escape would deactivate the tool, etc.
    input.addEventListener(
      'keydown',
      (e) => {
        // Always stop the event from reaching the document — the input
        // is the rightful owner of every keystroke while it's open.
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          this.completeTextInput();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancelTextInput();
        }
        // For other keys we let the default action proceed (character
        // gets typed into the input).
      },
      true
    );

    // Stop pointer events from bubbling up to the canvas / document.
    const stop = (e: Event) => e.stopPropagation();
    input.addEventListener('mousedown', stop);
    input.addEventListener('mouseup', stop);
    input.addEventListener('click', stop);
    input.addEventListener('pointerdown', stop);

    document.body.appendChild(input);
    this.textInput = input;
    this.committed = false;

    input.focus();
    input.select();
  }

  private completeTextInput(): void {
    if (!this.textInput || this.committed) return;
    this.committed = true;

    const raw = this.textInput.value.trim();
    const text = TextSanitizer.sanitize(raw);
    const start = this.inputStartWorld;

    this.removeTextInput();
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;
    this.inputStartWorld = null;

    if (text && start) {
      const annotation = this.createAnnotation([start], { text });
      this.canvas
        .getElement()
        .dispatchEvent(new CustomEvent('annotationCreated', { detail: annotation }));
    }
  }

  private cancelTextInput(): void {
    if (!this.textInput) return;
    this.committed = true;
    this.removeTextInput();
    this.isDrawing = false;
    this.currentPoints = [];
    this.startPoint = null;
    this.inputStartWorld = null;
  }

  private removeTextInput(): void {
    if (this.textInput?.parentNode) {
      this.textInput.parentNode.removeChild(this.textInput);
    }
    this.textInput = null;
  }
}
