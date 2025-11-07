import { EventManager } from '../../../components/EventManager';

describe('EventManager', () => {
  let element: HTMLElement;
  let eventManager: EventManager;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
    eventManager = new EventManager(element);
  });

  afterEach(() => {
    eventManager.destroy();
    document.body.removeChild(element);
  });

  describe('Event Listeners', () => {
    it('should setup event listeners', () => {
      expect(() => eventManager.setupEventListeners()).not.toThrow();
    });

    it('should not setup duplicate listeners', () => {
      eventManager.setupEventListeners();
      expect(() => eventManager.setupEventListeners()).not.toThrow();
    });

    it('should dispatch custom events through setup listeners', () => {
      const handler = jest.fn();
      element.addEventListener('imageload', handler);
      eventManager.setupEventListeners();
      
      const event = new CustomEvent('imageLoad', { detail: { src: 'test.jpg' } });
      element.dispatchEvent(event);
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Event Handlers Creation', () => {
    it('should create event handlers for engine', () => {
      const handlers = eventManager.createEventHandlers();
      expect(handlers).toBeDefined();
      expect(typeof handlers.onImageLoad).toBe('function');
      expect(typeof handlers.onImageLoadError).toBe('function');
    });

    it('should handle image load event', () => {
      const handlers = eventManager.createEventHandlers();
      const handler = jest.fn();
      element.addEventListener('imageLoad', handler);
      
      handlers.onImageLoad({ src: 'test.jpg' } as any);
      expect(handler).toHaveBeenCalled();
    });

    it('should handle error event', () => {
      const handlers = eventManager.createEventHandlers();
      const handler = jest.fn();
      element.addEventListener('imageLoadError', handler);
      
      handlers.onImageLoadError(new Error('Test error'));
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should destroy and clean up resources', () => {
      eventManager.setupEventListeners();
      expect(() => eventManager.destroy()).not.toThrow();
    });

    it('should remove all event listeners on destroy', () => {
      const handler = jest.fn();
      eventManager.addEventListener('imageload', handler);
      eventManager.setupEventListeners();
      eventManager.destroy();
      
      const event = new CustomEvent('imageLoad');
      element.dispatchEvent(event);
      
      expect(handler).not.toHaveBeenCalled();
    });
  });
});

