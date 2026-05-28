import { App } from '../core/App';
import type { CanvasLensOptions } from '../types';
import { OverlayShell } from '../ui/OverlayShell';
import { error, warn } from '../utils/core/logger';

/**
 * Owns the full-screen overlay editor instance: shows the modal shell,
 * spins up a second App for editing, and shuts everything down on close.
 *
 * Phase 5 narrowed this to orchestration — the DOM scaffolding now lives
 * in `ui/OverlayShell.ts`.
 */
export class OverlayManager {
  private element: HTMLElement;
  private shell: OverlayShell | null = null;
  private overlayApp: App | null = null;
  private overlayOpen = false;
  /** When provided, used as the seed options for the overlay App. */
  private originalOptions: CanvasLensOptions | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /** Override what options the overlay App should be constructed with. */
  setOriginalOptions(options: CanvasLensOptions): void {
    this.originalOptions = options;
  }

  openOverlay(): void {
    if (this.overlayOpen) {
      warn('Overlay is already open');
      return;
    }

    try {
      this.shell = new OverlayShell({ onClose: () => this.closeOverlay() });
      this.overlayApp = new App({
        ...this.getOriginalOptions(),
        container: this.shell.canvasFrame,
        width: this.shell.canvasFrame.clientWidth || 1200,
        height: this.shell.canvasFrame.clientHeight || 800
      });
      this.shell.show();
      this.overlayOpen = true;
    } catch (err) {
      error('Failed to open overlay:', err);
      this.closeOverlay();
    }
  }

  closeOverlay(): void {
    if (!this.overlayOpen) return;
    try {
      this.shell?.hide();
      this.overlayApp?.destroy();
      this.overlayApp = null;
      this.shell?.destroy();
      this.shell = null;
      this.overlayOpen = false;
    } catch (err) {
      error('Failed to close overlay:', err);
    }
  }

  isOverlayOpen(): boolean {
    return this.overlayOpen;
  }

  /** Access the overlay App (when open) — useful for syncing annotations. */
  getOverlayApp(): App | null {
    return this.overlayApp;
  }

  /** @deprecated alias for getOverlayApp; kept for older callers. */
  getOverlayCanvasLens(): App | null {
    return this.overlayApp;
  }

  private getOriginalOptions(): CanvasLensOptions {
    if (this.originalOptions) return this.originalOptions;
    return {
      container: this.element,
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      tools: {
        zoom: true,
        pan: true,
        annotation: {
          rect: true,
          arrow: true,
          text: true,
          circle: true,
          line: true
        },
        comparison: true
      }
    };
  }

  destroy(): void {
    this.closeOverlay();
  }
}
