import type { Annotation, AnnotationStyle, Point, Rectangle } from '../types';
import { TextSanitizer } from '../utils/security/text-sanitizer';

import type { Renderer } from './Renderer';
import type { Store } from './Store';
import type { AppAction, AppState } from './state';

export interface TextInputControllerDeps {
  canvas: Renderer;
  store: Store<AppState, AppAction>;
  /** When `false`, every event handler in this controller bails. Used
   *  to pause the main App while the overlay editor is open. */
  isEnabled: () => boolean;
  /** Current active tool — read live each time the controller fires. */
  getActiveTool: () => string | null;
  getImageBounds: () => Rectangle | null;
  addAnnotation: (a: Annotation) => void;
}

/**
 * Standalone text-input controller.
 *
 * Bypasses the entire AnnotationTool / EventHandler / Controller / Manager
 * chain for the text tool. The reasoning is simple: text isn't a shape you
 * drag — it's a single-point click that spawns a DOM input. The shape-tool
 * pipeline (mousedown → tool plugin → preview → mouseup → annotation) is
 * the wrong abstraction for it and was the source of every text bug we
 * hit (focus race, document keydown hijacking, button-check, image-bounds
 * bailing, comparison-mode blocking, …).
 *
 * Contract here is minimal and self-contained:
 *
 *   1. While `state.tool.active === 'text'`, ANY mousedown on the canvas
 *      opens an input at the click point. The mousedown is consumed
 *      (stopImmediatePropagation) so other listeners don't run.
 *   2. The input is mounted to `document.body` with `position: fixed` —
 *      no shadow-DOM, no overflow:hidden, no z-index battles.
 *   3. The input's own keydown listener (capture phase) intercepts every
 *      keystroke so the library's document-level keydown never sees them.
 *   4. Enter commits, Escape cancels. No blur magic.
 *
 * Tool stays active across multiple inputs — each click opens a new one,
 * and the previous one (if any) is committed first.
 */
export class TextInputController {
  private input: HTMLInputElement | null = null;
  private worldStart: Point | null = null;
  private readonly boundMouseDown: (e: MouseEvent) => void;
  private readonly canvas: Renderer;
  private readonly store: Store<AppState, AppAction>;
  private readonly isEnabled: () => boolean;
  private readonly getActiveTool: () => string | null;
  private readonly getImageBounds: () => Rectangle | null;
  private readonly addAnnotation: (a: Annotation) => void;
  private destroyed = false;

  constructor(deps: TextInputControllerDeps) {
    this.canvas = deps.canvas;
    this.store = deps.store;
    this.isEnabled = deps.isEnabled;
    this.getActiveTool = deps.getActiveTool;
    this.getImageBounds = deps.getImageBounds;
    this.addAnnotation = deps.addAnnotation;
    this.boundMouseDown = this.onCanvasMouseDown.bind(this);
    // Capture phase, attached FIRST in the App constructor so it runs
    // before any other module's listener.
    this.canvas.getElement().addEventListener('mousedown', this.boundMouseDown, true);
  }

  private onCanvasMouseDown(e: MouseEvent): void {
    if (this.destroyed || !this.isEnabled()) return;
    if (this.getActiveTool() !== 'text') return;
    if (e.button === 1) return; // skip middle-click

    // We own this event. Nothing else should react to it.
    e.preventDefault();
    e.stopImmediatePropagation();

    // Commit any in-flight input before starting a new one.
    if (this.input) this.commit();

    const start = this.computeWorldStart(e);
    this.openInput(start, e.clientX, e.clientY);
  }

  /** Translate the click into a world-coordinate start point, clamped to
   *  the loaded image's bounds when known. */
  private computeWorldStart(e: MouseEvent): Point {
    const rect = this.canvas.getElement().getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const v = this.canvas.getViewState();
    const wx = (sx - v.offsetX) / v.scale;
    const wy = (sy - v.offsetY) / v.scale;
    const bounds = this.getImageBounds();
    if (!bounds) return { x: wx, y: wy };
    return {
      x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, wx)),
      y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, wy))
    };
  }

  private openInput(worldStart: Point, viewportX: number, viewportY: number): void {
    const style = this.store.getState().annotation.defaultStyle;
    const fontSize = style.fontSize ?? 20;
    const fontFamily = style.fontFamily ?? 'Arial, sans-serif';
    const strokeColor = style.strokeColor ?? '#000';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter text…';
    input.setAttribute('aria-label', 'Enter annotation text');
    input.dataset.canvaslensTextInput = '1';
    input.style.cssText = `
      position: fixed;
      left: ${viewportX}px;
      top: ${viewportY - fontSize - 6}px;
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
    `;

    // Capture-phase listener so the library's document-level keydown
    // (registered by AnnotationToolsEventHandler) never sees these keys.
    input.addEventListener(
      'keydown',
      (ev) => {
        ev.stopPropagation();
        if (ev.key === 'Enter') {
          ev.preventDefault();
          this.commit();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          this.cancel();
        }
        // Other keys: let the browser type into the input normally.
      },
      true
    );

    // Stop pointer events on the input from reaching the canvas.
    const stop = (ev: Event) => ev.stopPropagation();
    input.addEventListener('mousedown', stop, true);
    input.addEventListener('mouseup', stop, true);
    input.addEventListener('click', stop, true);

    document.body.appendChild(input);
    this.input = input;
    this.worldStart = worldStart;

    // Synchronous focus — no rAF / microtask dance.
    input.focus();
    input.select();
  }

  private commit(): void {
    if (!this.input) return;
    const raw = this.input.value.trim();
    const text = TextSanitizer.sanitize(raw);
    const start = this.worldStart;
    this.remove();
    if (text && start) {
      const style: AnnotationStyle = { ...this.store.getState().annotation.defaultStyle };
      this.addAnnotation({
        id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type: 'text',
        points: [start],
        style,
        data: { text }
      });
    }
  }

  private cancel(): void {
    this.remove();
  }

  private remove(): void {
    if (this.input?.parentNode) this.input.parentNode.removeChild(this.input);
    this.input = null;
    this.worldStart = null;
  }

  destroy(): void {
    this.destroyed = true;
    this.canvas.getElement().removeEventListener('mousedown', this.boundMouseDown, true);
    this.remove();
  }
}
