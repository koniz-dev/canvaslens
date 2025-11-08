import { MemoryManager } from '../../../utils/core/memory-manager';

describe('MemoryManager', () => {
  beforeEach(() => {
    // Clear all cleanup callbacks before each test
    MemoryManager.cleanup();
  });

  describe('Cleanup Callbacks', () => {
    it('should register cleanup callback', () => {
      const callback = jest.fn();
      
      MemoryManager.registerCleanup(callback);
      MemoryManager.cleanup();
      
      expect(callback).toHaveBeenCalled();
    });

    it('should unregister cleanup callback', () => {
      const callback = jest.fn();
      
      MemoryManager.registerCleanup(callback);
      MemoryManager.unregisterCleanup(callback);
      MemoryManager.cleanup();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call all registered callbacks on cleanup', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();
      
      MemoryManager.registerCleanup(callback1);
      MemoryManager.registerCleanup(callback2);
      MemoryManager.registerCleanup(callback3);
      
      MemoryManager.cleanup();
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it('should handle errors in cleanup callbacks', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Cleanup error');
      });
      const normalCallback = jest.fn();
      
      MemoryManager.registerCleanup(errorCallback);
      MemoryManager.registerCleanup(normalCallback);
      
      expect(() => MemoryManager.cleanup()).not.toThrow();
      expect(normalCallback).toHaveBeenCalled();
    });

    it('should clear callbacks after cleanup', () => {
      const callback = jest.fn();
      
      MemoryManager.registerCleanup(callback);
      MemoryManager.cleanup();
      MemoryManager.cleanup(); // Second cleanup should not call callback again
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should prevent recursive cleanup', () => {
      let callCount = 0;
      const recursiveCallback = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          MemoryManager.cleanup(); // Try to trigger cleanup again
        }
      });
      
      MemoryManager.registerCleanup(recursiveCallback);
      
      expect(() => MemoryManager.cleanup()).not.toThrow();
      expect(recursiveCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('WeakMap and WeakSet', () => {
    it('should create WeakMap', () => {
      const weakMap = MemoryManager.createWeakMap<object, string>();
      
      expect(weakMap).toBeInstanceOf(WeakMap);
    });

    it('should create WeakSet', () => {
      const weakSet = MemoryManager.createWeakSet<object>();
      
      expect(weakSet).toBeInstanceOf(WeakSet);
    });

    it('should use WeakMap for memory-efficient storage', () => {
      const weakMap = MemoryManager.createWeakMap<object, string>();
      const key = {};
      const value = 'test';
      
      weakMap.set(key, value);
      expect(weakMap.get(key)).toBe(value);
    });

    it('should use WeakSet for memory-efficient storage', () => {
      const weakSet = MemoryManager.createWeakSet<object>();
      const obj = {};
      
      weakSet.add(obj);
      expect(weakSet.has(obj)).toBe(true);
    });
  });

  describe('Debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const func = jest.fn();
      const debounced = MemoryManager.debounce(func, 100);
      
      debounced();
      debounced();
      debounced();
      
      expect(func).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should reset debounce timer on new calls', () => {
      const func = jest.fn();
      const debounced = MemoryManager.debounce(func, 100);
      
      debounced();
      jest.advanceTimersByTime(50);
      
      debounced();
      jest.advanceTimersByTime(50);
      
      expect(func).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const func = jest.fn();
      const debounced = MemoryManager.debounce(func, 100);
      
      debounced('arg1', 'arg2');
      jest.advanceTimersByTime(100);
      
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should cleanup debounced function', () => {
      const func = jest.fn();
      const debounced = MemoryManager.debounce(func, 100);
      
      debounced();
      
      if (debounced.cleanup) {
        debounced.cleanup();
      }
      
      jest.advanceTimersByTime(100);
      
      expect(func).not.toHaveBeenCalled();
    });
  });

  describe('Throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const func = jest.fn();
      const throttled = MemoryManager.throttle(func, 100);
      
      throttled();
      throttled();
      throttled();
      
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should allow function call after throttle period', () => {
      const func = jest.fn();
      const throttled = MemoryManager.throttle(func, 100);
      
      throttled();
      expect(func).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      
      throttled();
      expect(func).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to throttled function', () => {
      const func = jest.fn();
      const throttled = MemoryManager.throttle(func, 100);
      
      throttled('arg1', 'arg2');
      
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should cleanup throttled function', () => {
      const func = jest.fn();
      const throttled = MemoryManager.throttle(func, 100);
      
      throttled();
      expect(func).toHaveBeenCalledTimes(1);
      
      if (throttled.cleanup) {
        throttled.cleanup();
      }
      
      jest.advanceTimersByTime(100);
      
      // After cleanup, throttle state should be reset, so next call should work
      throttled();
      expect(func).toHaveBeenCalledTimes(2);
    });

    it('should ignore calls during throttle period', () => {
      const func = jest.fn();
      const throttled = MemoryManager.throttle(func, 100);
      
      throttled();
      expect(func).toHaveBeenCalledTimes(1);
      
      throttled();
      throttled();
      throttled();
      
      expect(func).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      
      throttled();
      expect(func).toHaveBeenCalledTimes(2);
    });
  });
});

