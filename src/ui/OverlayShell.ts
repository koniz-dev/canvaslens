/**
 * Provides the full-screen overlay shell that hosts a CanvasLens App for the
 * "overlay editor" experience. Replaces the inline modal CSS that used to live
 * inside OverlayManager.
 */
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

export class OverlayShell {
  readonly backdrop: HTMLDivElement;
  readonly canvasFrame: HTMLDivElement;
  private closeButton: HTMLButtonElement;
  private onClose: () => void;
  private keyHandler: (e: KeyboardEvent) => void;
  private backdropClickHandler: (e: MouseEvent) => void;
  private destroyed = false;

  constructor(options: OverlayShellOptions) {
    this.onClose = options.onClose;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'canvaslens-overlay-backdrop';
    this.backdrop.style.cssText = BACKDROP_STYLE;

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
