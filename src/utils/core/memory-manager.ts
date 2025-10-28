import { warn } from './logger';

export class MemoryManager {
  private static cleanupCallbacks: Array<() => void> = [];
  private static isCleaningUp = false;

  static registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  static unregisterCleanup(callback: () => void): void {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index > -1) {
      this.cleanupCallbacks.splice(index, 1);
    }
  }

  static cleanup(): void {
    if (this.isCleaningUp) return;
    
    this.isCleaningUp = true;
    
    try {
      this.cleanupCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          warn('Cleanup callback failed:', error);
        }
      });
      
      this.cleanupCallbacks.length = 0;
    } finally {
      this.isCleaningUp = false;
    }
  }

  static createWeakMap<K extends object, V>(): WeakMap<K, V> {
    return new WeakMap<K, V>();
  }

  static createWeakSet<T extends object>(): WeakSet<T> {
    return new WeakSet<T>();
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T & { cleanup?: () => void } {
    let timeout: number | null = null;
    
    const debounced = (...args: Parameters<T>) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };

    // Add cleanup method to debounced function
    (debounced as any).cleanup = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    return debounced;
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T & { cleanup?: () => void } {
    let inThrottle: boolean = false;
    let timeoutId: number | null = null;
    
    const throttled = (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        timeoutId = window.setTimeout(() => {
          inThrottle = false;
          timeoutId = null;
        }, limit);
      }
    };

    // Add cleanup method to throttled function
    (throttled as any).cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
        inThrottle = false;
      }
    };

    return throttled;
  }
}
