/**
 * Provides the full-screen overlay shell that hosts a CanvasLens App for the
 * "overlay editor" experience. Replaces the inline modal CSS that used to live
 * inside OverlayManager.
 */
export interface OverlayToolButton {
  /** Identifier passed to `onToolClick` (e.g. 'rect', 'arrow', 'text'). */
  type: string;
  /** Short label, usually an emoji or one-letter glyph. */
  label: string;
  /** Optional title / tooltip. */
  title?: string;
}

export interface OverlayShellOptions {
  /** Called when the user requests to close the overlay (Esc key, backdrop
   * click, or close button). */
  onClose: () => void;
  /**
   * Background of the inner canvas frame. Defaults to `'white'`. Pass
   * `'transparent'`, `'none'`, `null`, or `''` to skip the white card and
   * let the backdrop show through behind the canvas.
   */
  frameBackground?: string | null;
  /** Tool buttons rendered at the top of the overlay so users don't need
   *  keyboard shortcuts to switch tools. Omit / empty for no toolbar. */
  toolButtons?: OverlayToolButton[];
  /** Click handler for the tool buttons. Receives the `type` of the
   *  button that was clicked. */
  onToolClick?: (type: string) => void;
  /** Returns the type of the currently-active tool so the toolbar can
   *  highlight it. Called on every render of the toolbar. */
  getActiveTool?: () => string | null;
}

const BACKDROP_STYLE = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CLOSE_BUTTON_STYLE = `
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10001;
`;

const CANVAS_FRAME_BASE_STYLE = `
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  max-height: 800px;
  border-radius: 8px;
  overflow: hidden;
`;

function isTransparentBg(bg: string | null | undefined): boolean {
  return bg === null || bg === undefined || bg === '' || bg === 'transparent' || bg === 'none';
}

const TOOLBAR_STYLE = `
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  z-index: 10001;
`;

const TOOL_BUTTON_STYLE = `
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 36px;
`;

const TOOL_BUTTON_ACTIVE_STYLE = `
  background: #0066cc;
  border-color: #0066cc;
`;

export class OverlayShell {
  readonly backdrop: HTMLDivElement;
  readonly canvasFrame: HTMLDivElement;
  private closeButton: HTMLButtonElement;
  private toolbar: HTMLDivElement | null = null;
  private toolButtons = new Map<string, HTMLButtonElement>();
  private getActiveTool: (() => string | null) | undefined;
  private onClose: () => void;
  private keyHandler: (e: KeyboardEvent) => void;
  private backdropClickHandler: (e: MouseEvent) => void;
  private destroyed = false;

  constructor(options: OverlayShellOptions) {
    this.onClose = options.onClose;
    this.getActiveTool = options.getActiveTool;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'canvaslens-overlay-backdrop';
    this.backdrop.style.cssText = BACKDROP_STYLE;

    if (options.toolButtons && options.toolButtons.length > 0 && options.onToolClick) {
      this.toolbar = document.createElement('div');
      this.toolbar.className = 'canvaslens-overlay-toolbar';
      this.toolbar.style.cssText = TOOLBAR_STYLE;
      const onToolClick = options.onToolClick;
      for (const btnSpec of options.toolButtons) {
        const btn = document.createElement('button');
        btn.textContent = btnSpec.label;
        if (btnSpec.title) btn.title = btnSpec.title;
        btn.style.cssText = TOOL_BUTTON_STYLE;
        btn.dataset.tool = btnSpec.type;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onToolClick(btnSpec.type);
          this.refreshToolbarActive();
        });
        this.toolbar.appendChild(btn);
        this.toolButtons.set(btnSpec.type, btn);
      }
      this.backdrop.appendChild(this.toolbar);
    }

    this.closeButton = document.createElement('button');
    this.closeButton.textContent = '✕';
    this.closeButton.style.cssText = CLOSE_BUTTON_STYLE;
    this.closeButton.addEventListener('click', () => this.onClose());
    this.backdrop.appendChild(this.closeButton);

    this.canvasFrame = document.createElement('div');
    this.canvasFrame.className = 'canvaslens-overlay-frame';
    const bg = options.frameBackground === undefined ? 'white' : options.frameBackground;
    const bgRule = isTransparentBg(bg) ? '' : `background: ${bg};`;
    this.canvasFrame.style.cssText = CANVAS_FRAME_BASE_STYLE + bgRule;
    this.backdrop.appendChild(this.canvasFrame);

    this.keyHandler = (e) => {
      if (e.key === 'Escape') this.onClose();
    };
    this.backdropClickHandler = (e) => {
      if (e.target === this.backdrop) this.onClose();
    };

    document.body.appendChild(this.backdrop);
    document.addEventListener('keydown', this.keyHandler);
    this.backdrop.addEventListener('click', this.backdropClickHandler);
  }

  show(): void {
    this.backdrop.style.display = 'flex';
    this.refreshToolbarActive();
  }

  /** Sync the visual active-state of each tool button. Call after the
   *  overlay App's active tool changes. */
  refreshToolbarActive(): void {
    if (!this.toolbar || !this.getActiveTool) return;
    const active = this.getActiveTool();
    for (const [type, btn] of this.toolButtons) {
      btn.style.cssText = TOOL_BUTTON_STYLE + (type === active ? TOOL_BUTTON_ACTIVE_STYLE : '');
    }
  }

  hide(): void {
    this.backdrop.style.display = 'none';
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    document.removeEventListener('keydown', this.keyHandler);
    this.backdrop.removeEventListener('click', this.backdropClickHandler);
    if (this.backdrop.parentNode === document.body) {
      document.body.removeChild(this.backdrop);
    }
  }
}
