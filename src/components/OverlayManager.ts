/**
 * Manages overlay mode for CanvasLens Web Component
 */
import { Engine } from '@/core';
import { CanvasLensOptions } from '@/types';
import { error, warn } from '@/utils';

export class OverlayManager {
  private element: HTMLElement;
  private overlayContainer: HTMLElement | null = null;
  private overlayCanvasLens: Engine | null = null;
  private overlayOpen = false;
  private originalOptions: CanvasLensOptions | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * Open overlay mode (full-screen editor)
   */
  openOverlay(): void {
    if (this.overlayOpen) {
      warn('Overlay is already open');
      return;
    }

    try {
      this.createOverlayContainer();
      this.createOverlayCanvasLens();
      this.setupOverlayEventHandlers();
      this.showOverlay();
      this.overlayOpen = true;
    } catch (err) {
      error('Failed to open overlay:', err);
      this.closeOverlay();
    }
  }

  /**
   * Close overlay mode
   */
  closeOverlay(): void {
    if (!this.overlayOpen) {
      return;
    }

    try {
      this.hideOverlay();
      this.destroyOverlayCanvasLens();
      this.destroyOverlayContainer();
      this.overlayOpen = false;
    } catch (err) {
      error('Failed to close overlay:', err);
    }
  }

  /**
   * Check if overlay is currently open
   */
  isOverlayOpen(): boolean {
    return this.overlayOpen;
  }

  /**
   * Get overlay CanvasLens instance
   */
  getOverlayCanvasLens(): Engine | null {
    return this.overlayCanvasLens;
  }

  /**
   * Create overlay container
   */
  private createOverlayContainer(): void {
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.style.cssText = `
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

    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
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
    closeButton.addEventListener('click', () => this.closeOverlay());

    this.overlayContainer.appendChild(closeButton);
    document.body.appendChild(this.overlayContainer);
  }

  /**
   * Create overlay CanvasLens instance
   */
  private createOverlayCanvasLens(): void {
    if (!this.overlayContainer) {
      throw new Error('Overlay container not created');
    }

    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
      width: 90vw;
      height: 90vh;
      max-width: 1200px;
      max-height: 800px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    `;
    this.overlayContainer.appendChild(canvasContainer);

    this.originalOptions = this.getOriginalOptions();

    this.overlayCanvasLens = new Engine({
      ...this.originalOptions,
      container: canvasContainer,
      width: canvasContainer.clientWidth,
      height: canvasContainer.clientHeight
    });
  }

  /**
   * Get original CanvasLens options
   */
  private getOriginalOptions(): CanvasLensOptions {
    // This would need to be passed from the main component
    // For now, return a basic configuration
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

  /**
   * Set up event handlers for overlay
   */
  private setupOverlayEventHandlers(): void {
    if (!this.overlayContainer) return;

    // Close on escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeOverlay();
      }
    };

    // Close on background click
    const handleBackgroundClick = (e: MouseEvent) => {
      if (e.target === this.overlayContainer) {
        this.closeOverlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    this.overlayContainer.addEventListener('click', handleBackgroundClick);

    // Store handlers for cleanup
    (this.overlayContainer as any)._keyHandler = handleKeyDown;
    (this.overlayContainer as any)._clickHandler = handleBackgroundClick;
  }

  /**
   * Show overlay
   */
  private showOverlay(): void {
    if (this.overlayContainer) {
      this.overlayContainer.style.display = 'flex';
    }
  }

  /**
   * Hide overlay
   */
  private hideOverlay(): void {
    if (this.overlayContainer) {
      this.overlayContainer.style.display = 'none';
    }
  }

  /**
   * Destroy overlay CanvasLens instance
   */
  private destroyOverlayCanvasLens(): void {
    if (this.overlayCanvasLens) {
      // Copy annotations back to main instance if needed
      // This would require access to the main CanvasLens instance
      this.overlayCanvasLens = null;
    }
  }

  /**
   * Destroy overlay container
   */
  private destroyOverlayContainer(): void {
    if (this.overlayContainer) {
      // Clean up event handlers
      const keyHandler = (this.overlayContainer as any)._keyHandler;
      const clickHandler = (this.overlayContainer as any)._clickHandler;
      
      if (keyHandler) {
        document.removeEventListener('keydown', keyHandler);
      }
      if (clickHandler) {
        this.overlayContainer.removeEventListener('click', clickHandler);
      }

      document.body.removeChild(this.overlayContainer);
      this.overlayContainer = null;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.closeOverlay();
  }
}
