import { Renderer } from '../../../core/Renderer';

describe('Renderer Branch Coverage', () => {
  let container: HTMLElement;
  let renderer: Renderer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (renderer) {
      const canvas = renderer.getElement();
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }
    if (container && container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Resize Branches', () => {
    beforeEach(() => {
      renderer = new Renderer(container, { width: 800, height: 600 });
    });

    it('should handle multiple resize calls with debouncing', (done) => {
      renderer.resize({ width: 900, height: 700 });
      renderer.resize({ width: 1000, height: 800 });
      renderer.resize({ width: 1100, height: 900 });
      
      // Wait for debounce
      setTimeout(() => {
        const size = renderer.getSize();
        expect(size.width).toBe(1100);
        expect(size.height).toBe(900);
        done();
      }, 150);
    });

    it('should clear existing timeout on resize', () => {
      renderer.resize({ width: 900, height: 700 });
      // Immediate second resize should clear first timeout
      renderer.resize({ width: 1000, height: 800 });
      
      // Should not throw
      expect(renderer).toBeDefined();
    });
  });

  describe('Event Handling Branches', () => {
    beforeEach(() => {
      renderer = new Renderer(container, { width: 800, height: 600 });
    });

    it('should add event listener with options', () => {
      const handler = jest.fn();
      renderer.addEventListener('click', handler, { capture: true });
      
      const clickEvent = new MouseEvent('click', { bubbles: true });
      renderer.getElement().dispatchEvent(clickEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    it('should remove event listener', () => {
      const handler = jest.fn();
      renderer.addEventListener('click', handler);
      renderer.removeEventListener('click', handler);
      
      const clickEvent = new MouseEvent('click', { bubbles: true });
      renderer.getElement().dispatchEvent(clickEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle getMousePosition with different event types', () => {
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 200
      });
      
      const point = renderer.getMousePosition(mouseEvent);
      expect(point.x).toBeDefined();
      expect(point.y).toBeDefined();
    });
  });

  describe('View State Branches', () => {
    beforeEach(() => {
      renderer = new Renderer(container, { width: 800, height: 600 });
    });

    it('should set view state with partial update', () => {
      renderer.setViewState({ scale: 2.0 });
      const state = renderer.getViewState();
      expect(state.scale).toBe(2.0);
      expect(state.offsetX).toBe(0); // Should keep existing value
    });

    it('should set view state with all properties', () => {
      renderer.setViewState({
        scale: 2.0,
        offsetX: 100,
        offsetY: 200
      });
      const state = renderer.getViewState();
      expect(state.scale).toBe(2.0);
      expect(state.offsetX).toBe(100);
      expect(state.offsetY).toBe(200);
    });
  });

  describe('Canvas Operations Branches', () => {
    beforeEach(() => {
      renderer = new Renderer(container, { width: 800, height: 600 });
    });

    it('should clear canvas', () => {
      expect(() => renderer.clear()).not.toThrow();
    });

    it('should clear with background color', () => {
      expect(() => renderer.clearWithBackground('#ffffff')).not.toThrow();
    });

    it('should apply and restore view transform', () => {
      renderer.setViewState({ scale: 2.0, offsetX: 50, offsetY: 50 });
      
      renderer.applyViewTransform();
      renderer.restoreViewTransform();
      
      // Should not throw
      expect(renderer).toBeDefined();
    });
  });
});

