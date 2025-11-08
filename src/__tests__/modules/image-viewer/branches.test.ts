import { ImageViewer } from '../../../modules/image-viewer/Viewer';
import { ComparisonManager } from '../../../modules/comparison/Manager';
import type { ComparisonOptions } from '../../../types';

describe('ImageViewer Branch Coverage', () => {
  let container: HTMLElement;
  let imageViewer: ImageViewer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (imageViewer) {
      imageViewer.getCanvas().getElement().remove();
    }
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Comparison Mode Rendering Branches', () => {
    beforeEach(async () => {
      const comparisonOptions: ComparisonOptions = {
        comparisonMode: true
      };
      imageViewer = new ImageViewer(
        container,
        { width: 800, height: 600 },
        {},
        undefined,
        undefined,
        comparisonOptions
      );
      
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await imageViewer.loadImage(testImageSrc);
    });

    it('should render comparison mode when enabled', () => {
      expect(() => imageViewer.render()).not.toThrow();
    });

    it('should render comparison mode with image bounds', () => {
      const comparisonManager = imageViewer.getComparisonManager();
      if (comparisonManager) {
        comparisonManager.setComparisonMode(true);
        expect(() => imageViewer.render()).not.toThrow();
      }
    });

    it('should render comparison mode with annotation manager', async () => {
      const comparisonOptions: ComparisonOptions = {
        comparisonMode: true
      };
      const viewerWithAnnotations = new ImageViewer(
        container,
        { width: 800, height: 600 },
        {},
        undefined,
        { enabled: true },
        comparisonOptions
      );
      
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewerWithAnnotations.loadImage(testImageSrc);
      
      expect(() => viewerWithAnnotations.render()).not.toThrow();
    });

    it('should handle renderComparison early return when missing data', () => {
      // Create viewer without proper setup
      const viewer = new ImageViewer(container, { width: 800, height: 600 });
      // renderComparison should handle missing data gracefully
      expect(() => viewer.render()).not.toThrow();
    });
  });

  describe('Image Loading Branches', () => {
    beforeEach(() => {
      imageViewer = new ImageViewer(container, { width: 800, height: 600 });
    });

    it('should handle loadImageElement with incomplete image', () => {
      const img = new Image();
      Object.defineProperty(img, 'complete', { value: false, writable: false, configurable: true });
      Object.defineProperty(img, 'naturalWidth', { value: 0, writable: false, configurable: true });
      
      expect(() => imageViewer.loadImageElement(img)).toThrow();
    });

    it('should handle loadImageElementOverlay with incomplete image', () => {
      const img = new Image();
      Object.defineProperty(img, 'complete', { value: false, writable: false, configurable: true });
      Object.defineProperty(img, 'naturalWidth', { value: 0, writable: false, configurable: true });
      
      expect(() => imageViewer.loadImageElementOverlay(img)).toThrow();
    });

    it('should handle render when no image loaded', () => {
      expect(() => imageViewer.render()).not.toThrow();
    });
  });

  describe('Zoom Pan Handler Branches', () => {
    beforeEach(async () => {
      imageViewer = new ImageViewer(container, { width: 800, height: 600 });
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await imageViewer.loadImage(testImageSrc);
    });

    it('should handle fitToView when zoomPanHandler exists', () => {
      expect(() => imageViewer.fitToView()).not.toThrow();
    });

    it('should handle fitToViewOverlay when zoomPanHandler exists', () => {
      expect(() => imageViewer.fitToViewOverlay()).not.toThrow();
    });

    it('should handle resetView when zoomPanHandler exists', () => {
      expect(() => imageViewer.resetView()).not.toThrow();
    });

    it('should return default zoom when zoomPanHandler is null', () => {
      const viewerWithoutZoom = new ImageViewer(container, { width: 800, height: 600 });
      expect(viewerWithoutZoom.getZoomLevel()).toBe(1);
    });

    it('should return default pan when zoomPanHandler is null', () => {
      const viewerWithoutZoom = new ImageViewer(container, { width: 800, height: 600 });
      const pan = viewerWithoutZoom.getPanOffset();
      expect(pan.x).toBe(0);
      expect(pan.y).toBe(0);
    });
  });

  describe('Annotation Manager Branches', () => {
    it('should handle render when annotationManager exists', async () => {
      imageViewer = new ImageViewer(container, { width: 800, height: 600 });
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await imageViewer.loadImage(testImageSrc);
      
      expect(() => imageViewer.render()).not.toThrow();
    });
  });

  describe('Comparison Manager Branches', () => {
    it('should handle render when comparisonManager exists and mode is enabled', async () => {
      const comparisonOptions: ComparisonOptions = {
        comparisonMode: true
      };
      imageViewer = new ImageViewer(
        container,
        { width: 800, height: 600 },
        {},
        undefined,
        undefined,
        comparisonOptions
      );
      
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await imageViewer.loadImage(testImageSrc);
      
      expect(() => imageViewer.render()).not.toThrow();
    });

    it('should handle render when comparisonManager exists but mode is disabled', async () => {
      const comparisonOptions: ComparisonOptions = {
        comparisonMode: false
      };
      imageViewer = new ImageViewer(
        container,
        { width: 800, height: 600 },
        {},
        undefined,
        undefined,
        comparisonOptions
      );
      
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await imageViewer.loadImage(testImageSrc);
      
      expect(() => imageViewer.render()).not.toThrow();
    });
  });
});
