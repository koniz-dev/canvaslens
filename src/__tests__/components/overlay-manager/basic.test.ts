import { OverlayManager } from '../../../components/OverlayManager';

describe('OverlayManager', () => {
  let element: HTMLElement;
  let overlayManager: OverlayManager;

  beforeEach(() => {
    element = document.createElement('div');
    element.style.width = '800px';
    element.style.height = '600px';
    document.body.appendChild(element);
    overlayManager = new OverlayManager(element);
  });

  afterEach(() => {
    if (overlayManager.isOverlayOpen()) {
      overlayManager.closeOverlay();
    }
    document.body.removeChild(element);
  });

  describe('Overlay Operations', () => {
    it('should open overlay', () => {
      overlayManager.openOverlay();
      expect(overlayManager.isOverlayOpen()).toBe(true);
    });

    it('should close overlay', () => {
      overlayManager.openOverlay();
      overlayManager.closeOverlay();
      expect(overlayManager.isOverlayOpen()).toBe(false);
    });

    it('should not open overlay if already open', () => {
      overlayManager.openOverlay();
      const initialState = overlayManager.isOverlayOpen();
      overlayManager.openOverlay();
      expect(overlayManager.isOverlayOpen()).toBe(initialState);
    });

    it('should not throw when closing already closed overlay', () => {
      expect(() => overlayManager.closeOverlay()).not.toThrow();
    });

    it('should get overlay CanvasLens instance', () => {
      overlayManager.openOverlay();
      const instance = overlayManager.getOverlayCanvasLens();
      expect(instance).toBeDefined();
    });

    it('should return null when overlay is closed', () => {
      const instance = overlayManager.getOverlayCanvasLens();
      expect(instance).toBeNull();
    });
  });
});

