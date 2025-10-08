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
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      
      timeout = window.setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}
