/**
 * Unit tests for EventManager
 */
import { EventManager } from '../components';

describe('EventManager', () => {
  let mockElement: HTMLElement;
  let eventManager: EventManager;
  let eventSpy: jest.SpyInstance;

  beforeEach(() => {
    mockElement = document.createElement('div');
    eventManager = new EventManager(mockElement);
    eventSpy = jest.spyOn(mockElement, 'dispatchEvent');
  });

  afterEach(() => {
    eventSpy.mockRestore();
  });

  describe('setupEventListeners', () => {
    it('should set up all event listeners', () => {
      const addEventListenerSpy = jest.spyOn(mockElement, 'addEventListener');
      
      eventManager.setupEventListeners();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('imageLoad', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('imageLoadError', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('zoomChange', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('panChange', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('annotationAdd', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('annotationRemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('toolChange', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('comparisonChange', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
    });

    it('should forward events with lowercase names', () => {
      eventManager.setupEventListeners();
      
      // Simulate imageLoad event
      const imageLoadEvent = new CustomEvent('imageLoad', { detail: { test: 'data' } });
      mockElement.dispatchEvent(imageLoadEvent);
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'imageload',
          detail: { test: 'data' }
        })
      );
    });
  });

  describe('createEventHandlers', () => {
    it('should create all required event handlers', () => {
      const handlers = eventManager.createEventHandlers();
      
      expect(handlers).toHaveProperty('onImageLoad');
      expect(handlers).toHaveProperty('onImageLoadError');
      expect(handlers).toHaveProperty('onZoomChange');
      expect(handlers).toHaveProperty('onPanChange');
      expect(handlers).toHaveProperty('onAnnotationAdd');
      expect(handlers).toHaveProperty('onAnnotationRemove');
      expect(handlers).toHaveProperty('onToolChange');
      expect(handlers).toHaveProperty('onComparisonChange');
    });

    it('should dispatch events when handlers are called', () => {
      const handlers = eventManager.createEventHandlers();
      
      // Test onImageLoad handler
      const imageData = {
        element: {} as HTMLImageElement,
        naturalSize: { width: 100, height: 100 },
        displaySize: { width: 100, height: 100 },
        position: { x: 0, y: 0 }
      };
      handlers.onImageLoad(imageData);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'imageLoad',
          detail: imageData
        })
      );
      
      // Test onZoomChange handler
      handlers.onZoomChange(2.5);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'zoomChange',
          detail: 2.5
        })
      );
    });
  });

  describe('destroy', () => {
    it('should clean up event listeners', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      eventManager.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });
});
