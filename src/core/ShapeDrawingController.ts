import type { ArrowTool } from '../modules/annotation/tools/components/ArrowTool';
import type { BaseTool } from '../modules/annotation/tools/components/BaseTool';
import type { CircleTool } from '../modules/annotation/tools/components/CircleTool';
import type { LineTool } from '../modules/annotation/tools/components/LineTool';
import type { RectangleTool } from '../modules/annotation/tools/components/RectangleTool';
import type { Annotation, AnnotationStyle, Point, Rectangle } from '../types';

import type { Renderer } from './Renderer';
import type { Store } from './Store';
import type { AppAction, AppState } from './state';

export type DrawableTool = RectangleTool | ArrowTool | CircleTool | LineTool;

export interface ShapeDrawingControllerDeps {
  canvas: Renderer;
  store: Store<AppState, AppAction>;
  /** When `false`, every event handler in this controller bails. Used
   *  to pause the main App while the overlay editor is open. */
  isEnabled: () => boolean;
  /** Active tool string from the App (e.g. 'rect', 'arrow', …, or null). */
  getActiveTool: () => string | null;
  /** Resolve a tool string to a tool instance — null if not a shape tool. */
  getShapeTool: (type: string) => BaseTool | null;
  getImageBounds: () => Rectangle | null;
  getDefaultStyle: () => AnnotationStyle;
  addAnnotation: (a: Annotation) => void;
  /** Re-render the canvas (used to show the drawing preview). */
  requestRender: () => void;
}

/**
 * Drawing controller for shape tools (rect / arrow / circle / line).
 *
 * Mirrors the `TextInputController` design — each tool family owns its
 * full interaction in one place, attached at the capture phase so no
 * other module can interfere:
 *
 *   mousedown  → if `getActiveTool()` is a shape tool, claim the event,
 *                ask the tool to start drawing, switch to drawing state.
 *   mousemove  → if in drawing state, ask the tool to continue drawing
 *                and re-render so the user sees a preview.
 *   mouseup    → if in drawing state, ask the tool to finish; the
 *                returned annotation (if any) is added via `addAnnotation`.
 *   ESC        → cancel the current drawing.
 *
 * The shape `BaseTool` subclasses still own per-tool drawing state
 * (startPoint / isDrawing / preview points) — this controller drives
 * their lifecycle instead of routing through `AnnotationToolsEventHandler`
 * / `AnnotationToolsManager` / `AnnotationToolsController`.
 */
export class ShapeDrawingController {
  private active: BaseTool | null = null;
  private destroyed = false;

  private readonly canvas: Renderer;
  private readonly store: Store<AppState, AppAction>;
  private readonly isEnabled: () => boolean;
  private readonly getActiveTool: () => string | null;
  private readonly getShapeTool: (type: string) => BaseTool | null;
  private readonly getImageBounds: () => Rectangle | null;
  private readonly addAnnotation: (a: Annotation) => void;
  private readonly requestRender: () => void;

  private readonly boundMouseDown: (e: MouseEvent) => void;
  private readonly boundMouseMove: (e: MouseEvent) => void;
  private readonly boundMouseUp: (e: MouseEvent) => void;
  private readonly boundKeyDown: (e: KeyboardEvent) => void;

  constructor(deps: ShapeDrawingControllerDeps) {
    this.canvas = deps.canvas;
    this.store = deps.store;
    this.isEnabled = deps.isEnabled;
    this.getActiveTool = deps.getActiveTool;
    this.getShapeTool = deps.getShapeTool;
    this.getImageBounds = deps.getImageBounds;
    this.addAnnotation = deps.addAnnotation;
    this.requestRender = deps.requestRender;

    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);

    // Capture phase, attached early in the App constructor (right after
    // TextInputController) so we beat the legacy EventHandler pipeline.
    const el = this.canvas.getElement();
    el.addEventListener('mousedown', this.boundMouseDown, true);
    // Move / up can be on document so drags off-canvas still resolve.
    document.addEventListener('mousemove', this.boundMouseMove, true);
    document.addEventListener('mouseup', this.boundMouseUp, true);
    document.addEventListener('keydown', this.boundKeyDown, true);

    // Suppress the browser's native context menu while a shape tool
    // is active (right-click is a valid "click" for trackpad users).
    el.addEventListener(
      'contextmenu',
      (e: Event) => {
        if (this.isShapeTool(this.getActiveTool())) e.preventDefault();
      },
      true
    );
    void this.store; // store reserved for future state queries; silence lint
  }

  private isShapeTool(type: string | null): type is 'rect' | 'arrow' | 'circle' | 'line' {
    return type === 'rect' || type === 'arrow' || type === 'circle' || type === 'line';
  }

  private onMouseDown(e: MouseEvent): void {
    if (this.destroyed || !this.isEnabled()) return;
    if (e.button === 1) return; // skip middle-click
    const toolType = this.getActiveTool();
    if (!this.isShapeTool(toolType)) return;

    const tool = this.getShapeTool(toolType);
    if (!tool) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const start = this.computeWorld(e);
    tool.startDrawing(start);
    this.active = tool;
    this.requestRender();
  }

  private onMouseMove(e: MouseEvent): void {
    if (this.destroyed || !this.active) return;
    e.stopPropagation();
    const point = this.computeWorld(e);
    this.active.continueDrawing(point);
    this.requestRender();
  }

  private onMouseUp(e: MouseEvent): void {
    if (this.destroyed || !this.active) return;
    e.stopPropagation();
    const end = this.computeWorld(e);
    const annotation = this.active.finishDrawing(end);
    this.active = null;
    if (annotation) this.addAnnotation(annotation);
    this.requestRender();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (this.destroyed || !this.isEnabled()) return;
    if (!this.active) return;
    // Don't hijack keys typed into form inputs.
    const target = e.target as HTMLElement | null;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.active.cancelDrawing();
      this.active = null;
      this.requestRender();
    }
  }

  /** Click → world coordinates, clamped to the loaded image when known. */
  private computeWorld(e: MouseEvent): Point {
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

  isDrawing(): boolean {
    return this.active !== null;
  }

  destroy(): void {
    this.destroyed = true;
    const el = this.canvas.getElement();
    el.removeEventListener('mousedown', this.boundMouseDown, true);
    document.removeEventListener('mousemove', this.boundMouseMove, true);
    document.removeEventListener('mouseup', this.boundMouseUp, true);
    document.removeEventListener('keydown', this.boundKeyDown, true);
    this.active?.cancelDrawing();
    this.active = null;
  }
}
