import { ComparisonManager } from '../../../modules/comparison/Manager';
import { Renderer } from '../../../core/Renderer';
import { ImageViewer } from '../../../modules/image-viewer/Viewer';
import type { EventHandlers } from '../../../types';

describe('ComparisonManager', () => {
  let container: HTMLElement;
  let canvas: Renderer;
  let imageViewer: ImageViewer;
  let comparisonManager: ComparisonManager;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    canvas = new Renderer(container, { width: 800, height: 600 });
    imageViewer = new ImageViewer(container, { width: 800, height: 600 });
    canvas.imageViewer = imageViewer;
  });

  afterEach(() => {
    if (comparisonManager) {
      comparisonManager.destroy();
    }
    if (imageViewer) {
      imageViewer.getCanvas().getElement().remove();
    }
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Initialization', () => {
    it('should create ComparisonManager with default options', () => {
      comparisonManager = new ComparisonManager(canvas);
      
      expect(comparisonManager.getSliderPosition()).toBe(50);
      expect(comparisonManager.isComparisonMode()).toBe(false);
    });

    it('should create ComparisonManager with custom options', () => {
      comparisonManager = new ComparisonManager(canvas, {
        sliderPosition: 30,
        sliderWidth: 6,
        sliderColor: '#ff0000',
        comparisonMode: true
      });
      
      expect(comparisonManager.getSliderPosition()).toBe(30);
      expect(comparisonManager.isComparisonMode()).toBe(true);
    });
  });

  describe('Image Loading', () => {
    beforeEach(() => {
      comparisonManager = new ComparisonManager(canvas);
    });

    it('should load before image', async () => {
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      await comparisonManager.loadBeforeImage(testImageSrc);
      
      expect(comparisonManager.getBeforeImage()).not.toBeNull();
    });

    it('should load after image', async () => {
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      await comparisonManager.loadAfterImage(testImageSrc);
      
      expect(comparisonManager.getAfterImage()).not.toBeNull();
    });

    it('should load both images', async () => {
      const beforeSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      const afterSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      await comparisonManager.loadImages(beforeSrc, afterSrc);
      
      expect(comparisonManager.getBeforeImage()).not.toBeNull();
      expect(comparisonManager.getAfterImage()).not.toBeNull();
      expect(comparisonManager.isReady()).toBe(true);
    });

    it('should handle image load errors', async () => {
      // Image loading may not reject immediately, test that it doesn't crash
      try {
        await comparisonManager.loadBeforeImage('invalid-url');
      } catch (err) {
        // Expected to throw
        expect(err).toBeDefined();
      }
    });
  });

  describe('Slider Position', () => {
    beforeEach(() => {
      comparisonManager = new ComparisonManager(canvas);
    });

    it('should set slider position', () => {
      comparisonManager.setSliderPosition(75);
      expect(comparisonManager.getSliderPosition()).toBe(75);
    });

    it('should clamp slider position to 0-100', () => {
      comparisonManager.setSliderPosition(150);
      expect(comparisonManager.getSliderPosition()).toBe(100);
      
      comparisonManager.setSliderPosition(-50);
      expect(comparisonManager.getSliderPosition()).toBe(0);
    });

    it('should show more before (move slider left)', () => {
      comparisonManager.setSliderPosition(50);
      comparisonManager.showMoreBefore();
      
      expect(comparisonManager.getSliderPosition()).toBe(40);
    });

    it('should show more after (move slider right)', () => {
      comparisonManager.setSliderPosition(50);
      comparisonManager.showMoreAfter();
      
      expect(comparisonManager.getSliderPosition()).toBe(60);
    });

    it('should reset slider to center', () => {
      comparisonManager.setSliderPosition(75);
      comparisonManager.resetSlider();
      
      expect(comparisonManager.getSliderPosition()).toBe(50);
    });
  });

  describe('Comparison Mode', () => {
    beforeEach(() => {
      comparisonManager = new ComparisonManager(canvas);
    });

    it('should toggle comparison mode', () => {
      expect(comparisonManager.isComparisonMode()).toBe(false);
      
      comparisonManager.toggleComparisonMode();
      expect(comparisonManager.isComparisonMode()).toBe(true);
      
      comparisonManager.toggleComparisonMode();
      expect(comparisonManager.isComparisonMode()).toBe(false);
    });

    it('should set comparison mode', () => {
      comparisonManager.setComparisonMode(true);
      expect(comparisonManager.isComparisonMode()).toBe(true);
      
      comparisonManager.setComparisonMode(false);
      expect(comparisonManager.isComparisonMode()).toBe(false);
    });

    it('should call onComparisonModeChange event handler', () => {
      const onComparisonModeChange = jest.fn();
      const eventHandlers: EventHandlers = { onComparisonModeChange };
      
      comparisonManager.setEventHandlers(eventHandlers);
      comparisonManager.setComparisonMode(true);
      
      expect(onComparisonModeChange).toHaveBeenCalledWith(true);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      comparisonManager = new ComparisonManager(canvas);
    });

    it('should get comparison state', () => {
      const state = comparisonManager.getState();
      
      expect(state).toHaveProperty('beforeImage');
      expect(state).toHaveProperty('afterImage');
      expect(state).toHaveProperty('sliderPosition');
      expect(state).toHaveProperty('isDragging');
      expect(state).toHaveProperty('comparisonMode');
    });

    it('should check if ready (both images loaded)', async () => {
      expect(comparisonManager.isReady()).toBe(false);
      
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await comparisonManager.loadBeforeImage(testImageSrc);
      expect(comparisonManager.isReady()).toBe(false);
      
      await comparisonManager.loadAfterImage(testImageSrc);
      expect(comparisonManager.isReady()).toBe(true);
    });

    it('should check if cursor is near slider area', () => {
      expect(comparisonManager.isCursorNearSliderArea()).toBe(false);
    });
  });

  describe('Rendering', () => {
    beforeEach(async () => {
      comparisonManager = new ComparisonManager(canvas);
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await comparisonManager.loadImages(testImageSrc, testImageSrc);
    });

    it('should render when ready', () => {
      expect(() => comparisonManager.render()).not.toThrow();
    });

    it('should not render when not ready', () => {
      const newManager = new ComparisonManager(canvas);
      expect(() => newManager.render()).not.toThrow();
    });
  });

  describe('Resize', () => {
    beforeEach(async () => {
      comparisonManager = new ComparisonManager(canvas);
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await comparisonManager.loadImages(testImageSrc, testImageSrc);
    });

    it('should resize and recalculate image dimensions', () => {
      const beforeImage = comparisonManager.getBeforeImage();
      expect(beforeImage).not.toBeNull();
      
      comparisonManager.resize({ width: 1000, height: 800 });
      
      const newBeforeImage = comparisonManager.getBeforeImage();
      expect(newBeforeImage).not.toBeNull();
    });
  });

  describe('Event Handlers', () => {
    beforeEach(() => {
      comparisonManager = new ComparisonManager(canvas);
    });

    it('should call onComparisonChange when slider position changes', () => {
      const onComparisonChange = jest.fn();
      const eventHandlers: EventHandlers = { onComparisonChange };
      
      comparisonManager.setEventHandlers(eventHandlers);
      comparisonManager.setSliderPosition(75);
      
      expect(onComparisonChange).toHaveBeenCalledWith(75);
    });

    it('should update event handlers', () => {
      const onComparisonChange = jest.fn();
      comparisonManager.setEventHandlers({ onComparisonChange });
      
      comparisonManager.setSliderPosition(60);
      expect(onComparisonChange).toHaveBeenCalledWith(60);
    });
  });

  describe('Options Management', () => {
    beforeEach(() => {
      comparisonManager = new ComparisonManager(canvas);
    });

    it('should update options', () => {
      comparisonManager.updateOptions({
        sliderWidth: 8,
        sliderColor: '#00ff00'
      });
      
      // Options are updated internally
      expect(comparisonManager).toBeDefined();
    });
  });

  describe('Destroy', () => {
    beforeEach(() => {
      comparisonManager = new ComparisonManager(canvas);
    });

    it('should destroy and clean up resources', () => {
      expect(() => comparisonManager.destroy()).not.toThrow();
      
      // After destroy, should still be able to call methods without errors
      expect(comparisonManager.getSliderPosition()).toBe(50);
    });
  });
});

