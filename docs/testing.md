# CanvasLens Testing Guide

## Table of Contents

- [Testing Overview](#testing-overview)
- [Testing Strategy](#testing-strategy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [Performance Testing](#performance-testing)
- [Visual Testing](#visual-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Testing Tools](#testing-tools)
- [Test Configuration](#test-configuration)
- [Best Practices](#best-practices)

## Testing Overview

CanvasLens uses a comprehensive testing strategy to ensure reliability, performance, and maintainability. The testing approach covers multiple levels from unit tests to end-to-end testing, with special attention to canvas rendering and user interactions.

### Testing Philosophy

- **Test-Driven Development**: Write tests before implementing features
- **Comprehensive Coverage**: Test all public APIs and critical paths
- **Performance Focus**: Ensure smooth user experience
- **Cross-Browser Testing**: Verify compatibility across browsers
- **Visual Regression**: Prevent unintended visual changes

### Testing Levels

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions
3. **Performance Tests**: Test rendering and interaction performance
4. **Visual Tests**: Test visual output and rendering
5. **End-to-End Tests**: Test complete user workflows

## Testing Strategy

### 1. Unit Tests (70%)
- Individual function testing
- Component logic testing
- Utility function testing
- Type validation testing

### 2. Integration Tests (20%)
- Component interaction testing
- Event system testing
- API integration testing
- Module communication testing

### 3. End-to-End Tests (10%)
- Complete user workflow testing
- Cross-browser testing
- Performance testing
- Visual regression testing

## Unit Testing

### 1. Testing Utilities

#### Test Setup
```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock canvas context
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  setTransform: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 })),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  createImageData: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  canvas: {
    width: 800,
    height: 600
  }
}));

// Mock Image
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload && this.onload();
    }, 0);
  }
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 800;
  height = 600;
};

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now())
};
```

#### Test Utilities
```typescript
// src/__tests__/utils/test-utils.ts
import { CanvasLens } from '../../CanvasLens';

export function createMockCanvasLens(options = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const viewer = new CanvasLens();
  Object.assign(viewer, options);
  container.appendChild(viewer);
  
  return { viewer, container };
}

export function cleanupMockCanvasLens(container: HTMLElement) {
  document.body.removeChild(container);
}

export function createMockImage(src: string, width = 800, height = 600) {
  const img = new Image();
  img.src = src;
  img.width = width;
  img.height = height;
  return img;
}

export function createMockAnnotation(type: string, x = 100, y = 100, width = 200, height = 150) {
  return {
    id: `test-${type}-${Date.now()}`,
    type,
    x,
    y,
    width,
    height,
    style: {
      strokeColor: '#ff0000',
      strokeWidth: 2,
      fillColor: 'rgba(255, 0, 0, 0.1)'
    }
  };
}

export function waitForEvent(element: HTMLElement, eventName: string, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event ${eventName} not fired within ${timeout}ms`));
    }, timeout);
    
    element.addEventListener(eventName, (event) => {
      clearTimeout(timer);
      resolve(event);
    }, { once: true });
  });
}
```

### 2. Core Component Tests

#### CanvasLens Component Tests
```typescript
// src/__tests__/core/CanvasLens.test.ts
import { CanvasLens } from '../../CanvasLens';
import { createMockCanvasLens, cleanupMockCanvasLens, waitForEvent } from '../utils/test-utils';

describe('CanvasLens', () => {
  let container: HTMLElement;
  let viewer: CanvasLens;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(viewer.width).toBe('800');
      expect(viewer.height).toBe('600');
      expect(viewer.tools).toBe('{}');
    });

    it('should accept custom attributes', () => {
      viewer.width = '1000px';
      viewer.height = '800px';
      viewer.src = 'test-image.jpg';

      expect(viewer.width).toBe('1000px');
      expect(viewer.height).toBe('800px');
      expect(viewer.src).toBe('test-image.jpg');
    });
  });

  describe('Image Loading', () => {
    it('should load image successfully', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      const loadPromise = waitForEvent(viewer, 'imageload');
      await viewer.loadImage(imageSrc);
      const event = await loadPromise;

      expect(event.detail).toBeDefined();
      expect(event.detail.naturalSize).toBeDefined();
    });

    it('should handle image load errors', async () => {
      const invalidSrc = 'invalid-image-url';
      
      const errorPromise = waitForEvent(viewer, 'error');
      await viewer.loadImage(invalidSrc);
      const event = await errorPromise;

      expect(event.detail).toBeDefined();
      expect(event.detail.type).toBe('ImageLoadError');
    });
  });

  describe('View Control', () => {
    it('should zoom to specified level', () => {
      viewer.zoomTo(2.0);
      expect(viewer.getZoom()).toBe(2.0);
    });

    it('should pan to specified position', () => {
      viewer.setPan(100, 50);
      const pan = viewer.getPan();
      expect(pan.x).toBe(100);
      expect(pan.y).toBe(50);
    });

    it('should reset view to initial state', () => {
      viewer.zoomTo(2.0);
      viewer.setPan(100, 50);
      viewer.resetView();
      
      expect(viewer.getZoom()).toBe(1.0);
      const pan = viewer.getPan();
      expect(pan.x).toBe(0);
      expect(pan.y).toBe(0);
    });
  });

  describe('Tool Management', () => {
    it('should activate specified tool', () => {
      viewer.activateTool('rect');
      expect(viewer.getActiveTool()).toBe('rect');
    });

    it('should deactivate current tool', () => {
      viewer.activateTool('rect');
      viewer.deactivateTool();
      expect(viewer.getActiveTool()).toBeNull();
    });

    it('should update tool configuration', () => {
      const newTools = {
        zoom: true,
        pan: true,
        annotation: { rect: true, arrow: true }
      };
      
      viewer.updateTools(newTools);
      expect(viewer.getTools()).toEqual(newTools);
    });
  });
});
```

#### Engine Tests
```typescript
// src/__tests__/core/Engine.test.ts
import { Engine } from '../../core/Engine';
import { CanvasLensOptions } from '../../types';

describe('Engine', () => {
  let container: HTMLElement;
  let engine: Engine;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    const options: CanvasLensOptions = {
      container,
      width: 800,
      height: 600
    };
    
    engine = new Engine(options);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should initialize with provided options', () => {
      expect(engine).toBeDefined();
      expect(engine.getZoom()).toBe(1.0);
    });

    it('should handle missing options gracefully', () => {
      const minimalOptions: CanvasLensOptions = {
        container
      };
      
      expect(() => new Engine(minimalOptions)).not.toThrow();
    });
  });

  describe('Image Operations', () => {
    it('should load image successfully', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      await engine.loadImage(imageSrc);
      expect(engine.getImageData()).toBeDefined();
    });
  });
});
```

### 3. Utility Function Tests

#### Logger Tests
```typescript
// src/__tests__/utils/logger.test.ts
import { log, warn, error, info } from '../../utils/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should log in development mode', () => {
      log('Test message');
      expect(consoleSpy).toHaveBeenCalledWith('Test message');
    });

    it('should warn in development mode', () => {
      warn('Warning message');
      expect(console.warn).toHaveBeenCalledWith('Warning message');
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should not log in production mode', () => {
      log('Test message');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should still show errors in production mode', () => {
      error('Error message');
      expect(console.error).toHaveBeenCalledWith('Error message');
    });
  });
});
```

#### Error Handler Tests
```typescript
// src/__tests__/utils/error-handler.test.ts
import { ErrorHandler, ErrorType } from '../../utils/error-handler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('Error Handling', () => {
    it('should handle image load errors', () => {
      const error = new Error('Failed to load image');
      const handledError = errorHandler.handleError(error, ErrorType.IMAGE_LOAD);
      
      expect(handledError.type).toBe(ErrorType.IMAGE_LOAD);
      expect(handledError.message).toBe('Failed to load image');
    });

    it('should handle invalid tool errors', () => {
      const error = new Error('Invalid tool');
      const handledError = errorHandler.handleError(error, ErrorType.INVALID_TOOL);
      
      expect(handledError.type).toBe(ErrorType.INVALID_TOOL);
    });

    it('should provide recovery suggestions', () => {
      const error = new Error('Image not found');
      const handledError = errorHandler.handleError(error, ErrorType.IMAGE_LOAD);
      
      expect(handledError.recovery).toBeDefined();
      expect(handledError.recovery.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Safe Async Operations', () => {
    it('should handle async operations safely', async () => {
      const asyncOperation = async () => {
        throw new Error('Async error');
      };
      
      const result = await errorHandler.safeAsync(asyncOperation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return success for successful operations', async () => {
      const asyncOperation = async () => {
        return 'success';
      };
      
      const result = await errorHandler.safeAsync(asyncOperation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
    });
  });
});
```

## Integration Testing

### 1. Component Integration Tests

#### CanvasLens Core Integration
```typescript
// src/__tests__/integration/CanvasLensCore.test.ts
import { CanvasLensCore } from '../../components/CanvasLensCore';
import { createMockCanvasLens, cleanupMockCanvasLens, waitForEvent } from '../utils/test-utils';

describe('CanvasLensCore Integration', () => {
  let container: HTMLElement;
  let core: CanvasLensCore;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    core = new CanvasLensCore(mock.viewer);
    core.initialize();
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Image Loading Integration', () => {
    it('should load image and update view state', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      const loadPromise = waitForEvent(container, 'imageload');
      await core.loadImage(imageSrc);
      const event = await loadPromise;

      expect(event.detail).toBeDefined();
      expect(core.getImageData()).toBeDefined();
    });
  });

  describe('Annotation Integration', () => {
    it('should add annotation and trigger events', async () => {
      const annotation = {
        id: 'test-annotation',
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150
      };

      const addPromise = waitForEvent(container, 'annotationadd');
      core.addAnnotation(annotation);
      const event = await addPromise;

      expect(event.detail).toEqual(annotation);
      expect(core.getAnnotations()).toContain(annotation);
    });

    it('should remove annotation and trigger events', async () => {
      const annotation = {
        id: 'test-annotation',
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150
      };

      core.addAnnotation(annotation);
      
      const removePromise = waitForEvent(container, 'annotationremove');
      core.removeAnnotation(annotation.id);
      const event = await removePromise;

      expect(event.detail).toBe(annotation.id);
      expect(core.getAnnotations()).not.toContain(annotation);
    });
  });

  describe('Tool Integration', () => {
    it('should activate tool and update state', () => {
      core.activateTool('rect');
      expect(core.getActiveTool()).toBe('rect');
      
      const toolChangePromise = waitForEvent(container, 'toolchange');
      core.activateTool('arrow');
      expect(core.getActiveTool()).toBe('arrow');
    });
  });
});
```

#### Event System Integration
```typescript
// src/__tests__/integration/EventManager.test.ts
import { EventManager } from '../../components/EventManager';
import { createMockCanvasLens, cleanupMockCanvasLens } from '../utils/test-utils';

describe('EventManager Integration', () => {
  let container: HTMLElement;
  let viewer: any;
  let eventManager: EventManager;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
    eventManager = new EventManager(viewer);
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Event Registration', () => {
    it('should register and trigger custom events', () => {
      const handler = jest.fn();
      eventManager.on('customEvent', handler);
      
      eventManager.emit('customEvent', { data: 'test' });
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle multiple event listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventManager.on('testEvent', handler1);
      eventManager.on('testEvent', handler2);
      
      eventManager.emit('testEvent', { data: 'test' });
      
      expect(handler1).toHaveBeenCalledWith({ data: 'test' });
      expect(handler2).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners', () => {
      const handler = jest.fn();
      eventManager.on('testEvent', handler);
      eventManager.off('testEvent', handler);
      
      eventManager.emit('testEvent', { data: 'test' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should cleanup all listeners on destroy', () => {
      const handler = jest.fn();
      eventManager.on('testEvent', handler);
      eventManager.destroy();
      
      eventManager.emit('testEvent', { data: 'test' });
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
```

### 2. Module Integration Tests

#### ImageViewer Integration
```typescript
// src/__tests__/integration/ImageViewer.test.ts
import { ImageViewer } from '../../modules/ImageViewer';
import { createMockCanvasLens, cleanupMockCanvasLens } from '../utils/test-utils';

describe('ImageViewer Integration', () => {
  let container: HTMLElement;
  let viewer: any;
  let imageViewer: ImageViewer;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
    
    imageViewer = new ImageViewer({
      container,
      enableZoom: true,
      enablePan: true
    });
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Image Loading', () => {
    it('should load and render image', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      await imageViewer.loadImage(imageSrc);
      expect(imageViewer.getImageData()).toBeDefined();
    });
  });

  describe('Zoom and Pan', () => {
    it('should handle zoom operations', () => {
      imageViewer.zoomTo(2.0);
      expect(imageViewer.getZoom()).toBe(2.0);
    });

    it('should handle pan operations', () => {
      imageViewer.setPan(100, 50);
      const pan = imageViewer.getPan();
      expect(pan.x).toBe(100);
      expect(pan.y).toBe(50);
    });

    it('should maintain zoom and pan state', () => {
      imageViewer.zoomTo(1.5);
      imageViewer.setPan(50, 25);
      
      expect(imageViewer.getZoom()).toBe(1.5);
      const pan = imageViewer.getPan();
      expect(pan.x).toBe(50);
      expect(pan.y).toBe(25);
    });
  });
});
```

## Performance Testing

### 1. Rendering Performance Tests

#### FPS Testing
```typescript
// src/__tests__/performance/rendering.test.ts
import { CanvasLens } from '../../CanvasLens';
import { createMockCanvasLens, cleanupMockCanvasLens } from '../utils/test-utils';

describe('Rendering Performance', () => {
  let container: HTMLElement;
  let viewer: CanvasLens;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('FPS Performance', () => {
    it('should maintain 60 FPS during zoom operations', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const startTime = performance.now();
      const frameCount = 60;
      
      for (let i = 0; i < frameCount; i++) {
        viewer.zoomTo(1 + i * 0.01);
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const fps = (frameCount / duration) * 1000;
      
      expect(fps).toBeGreaterThan(55); // Should maintain high FPS
    });

    it('should maintain 60 FPS during pan operations', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const startTime = performance.now();
      const frameCount = 60;
      
      for (let i = 0; i < frameCount; i++) {
        viewer.setPan(i, i);
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const fps = (frameCount / duration) * 1000;
      
      expect(fps).toBeGreaterThan(55);
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during repeated operations', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Perform repeated operations
      for (let i = 0; i < 100; i++) {
        await viewer.loadImage(imageSrc);
        viewer.zoomTo(1 + Math.random());
        viewer.setPan(Math.random() * 100, Math.random() * 100);
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
```

#### Load Time Performance
```typescript
// src/__tests__/performance/load-time.test.ts
import { CanvasLens } from '../../CanvasLens';
import { createMockCanvasLens, cleanupMockCanvasLens } from '../utils/test-utils';

describe('Load Time Performance', () => {
  let container: HTMLElement;
  let viewer: CanvasLens;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Image Load Time', () => {
    it('should load small images within 100ms', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      const startTime = performance.now();
      await viewer.loadImage(imageSrc);
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(100);
    });

    it('should load medium images within 500ms', async () => {
      // Create a larger test image
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 800, 600);
      const imageSrc = canvas.toDataURL();
      
      const startTime = performance.now();
      await viewer.loadImage(imageSrc);
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(500);
    });
  });

  describe('Initialization Time', () => {
    it('should initialize within 50ms', () => {
      const startTime = performance.now();
      const newViewer = new CanvasLens();
      const endTime = performance.now();
      
      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(50);
    });
  });
});
```

### 2. Annotation Performance Tests

#### Annotation Rendering Performance
```typescript
// src/__tests__/performance/annotations.test.ts
import { CanvasLens } from '../../CanvasLens';
import { createMockCanvasLens, cleanupMockCanvasLens, createMockAnnotation } from '../utils/test-utils';

describe('Annotation Performance', () => {
  let container: HTMLElement;
  let viewer: CanvasLens;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Large Number of Annotations', () => {
    it('should handle 1000 annotations efficiently', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const startTime = performance.now();
      
      // Add 1000 annotations
      for (let i = 0; i < 1000; i++) {
        const annotation = createMockAnnotation('rect', i % 800, i % 600, 50, 50);
        viewer.addAnnotation(annotation);
      }
      
      const endTime = performance.now();
      const addTime = endTime - startTime;
      
      expect(addTime).toBeLessThan(1000); // Should add 1000 annotations within 1 second
      expect(viewer.getAnnotations().length).toBe(1000);
    });

    it('should render 1000 annotations within 16ms', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      // Add annotations
      for (let i = 0; i < 1000; i++) {
        const annotation = createMockAnnotation('rect', i % 800, i % 600, 50, 50);
        viewer.addAnnotation(annotation);
      }

      const startTime = performance.now();
      viewer.render();
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(16); // Should render within one frame (16ms)
    });
  });

  describe('Annotation Operations', () => {
    it('should add annotations efficiently', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const annotation = createMockAnnotation('rect', i * 10, i * 10, 50, 50);
        viewer.addAnnotation(annotation);
      }
      
      const endTime = performance.now();
      const addTime = endTime - startTime;
      
      expect(addTime).toBeLessThan(100); // Should add 100 annotations within 100ms
    });

    it('should remove annotations efficiently', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      // Add annotations
      const annotations = [];
      for (let i = 0; i < 100; i++) {
        const annotation = createMockAnnotation('rect', i * 10, i * 10, 50, 50);
        viewer.addAnnotation(annotation);
        annotations.push(annotation);
      }

      const startTime = performance.now();
      
      annotations.forEach(annotation => {
        viewer.removeAnnotation(annotation.id);
      });
      
      const endTime = performance.now();
      const removeTime = endTime - startTime;
      
      expect(removeTime).toBeLessThan(100); // Should remove 100 annotations within 100ms
      expect(viewer.getAnnotations().length).toBe(0);
    });
  });
});
```

## Visual Testing

### 1. Visual Regression Tests

#### Canvas Output Testing
```typescript
// src/__tests__/visual/canvas-output.test.ts
import { CanvasLens } from '../../CanvasLens';
import { createMockCanvasLens, cleanupMockCanvasLens } from '../utils/test-utils';

describe('Canvas Output Visual Tests', () => {
  let container: HTMLElement;
  let viewer: CanvasLens;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Image Rendering', () => {
    it('should render image correctly', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const canvas = viewer.canvas;
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      
      // Check that image data is not empty
      expect(imageData.data.some(pixel => pixel !== 0)).toBe(true);
    });

    it('should maintain aspect ratio', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const imageData = viewer.getImageData();
      const aspectRatio = imageData.naturalSize.width / imageData.naturalSize.height;
      
      expect(aspectRatio).toBeCloseTo(1.0, 2); // Should be square
    });
  });

  describe('Annotation Rendering', () => {
    it('should render rectangle annotations correctly', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const annotation = {
        id: 'test-rect',
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        style: {
          strokeColor: '#ff0000',
          strokeWidth: 2,
          fillColor: 'rgba(255, 0, 0, 0.1)'
        }
      };

      viewer.addAnnotation(annotation);
      
      const canvas = viewer.canvas;
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      
      // Check that annotation was rendered (simplified check)
      expect(imageData.data).toBeDefined();
    });
  });
});
```

### 2. Cross-Browser Visual Tests

#### Browser Compatibility Testing
```typescript
// src/__tests__/visual/browser-compatibility.test.ts
import { CanvasLens } from '../../CanvasLens';
import { createMockCanvasLens, cleanupMockCanvasLens } from '../utils/test-utils';

describe('Browser Compatibility Visual Tests', () => {
  let container: HTMLElement;
  let viewer: CanvasLens;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Canvas Support', () => {
    it('should support canvas 2D context', () => {
      const canvas = viewer.canvas;
      const ctx = canvas.getContext('2d');
      
      expect(ctx).toBeDefined();
      expect(ctx.canvas).toBe(canvas);
    });

    it('should support image drawing', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);

      const canvas = viewer.canvas;
      const ctx = canvas.getContext('2d');
      
      // Test basic drawing operations
      expect(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, 100, 100);
        ctx.strokeRect(0, 0, 100, 100);
      }).not.toThrow();
    });
  });

  describe('Event Support', () => {
    it('should support mouse events', () => {
      const canvas = viewer.canvas;
      
      expect(() => {
        const event = new MouseEvent('mousedown', {
          clientX: 100,
          clientY: 100
        });
        canvas.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should support touch events', () => {
      const canvas = viewer.canvas;
      
      expect(() => {
        const event = new TouchEvent('touchstart', {
          touches: [{
            clientX: 100,
            clientY: 100
          }]
        });
        canvas.dispatchEvent(event);
      }).not.toThrow();
    });
  });
});
```

## End-to-End Testing

### 1. User Workflow Tests

#### Complete User Journey
```typescript
// src/__tests__/e2e/user-workflow.test.ts
import { CanvasLens } from '../../CanvasLens';
import { createMockCanvasLens, cleanupMockCanvasLens, waitForEvent } from '../utils/test-utils';

describe('User Workflow E2E Tests', () => {
  let container: HTMLElement;
  let viewer: CanvasLens;

  beforeEach(() => {
    const mock = createMockCanvasLens();
    container = mock.container;
    viewer = mock.viewer;
  });

  afterEach(() => {
    cleanupMockCanvasLens(container);
  });

  describe('Image Viewing Workflow', () => {
    it('should complete full image viewing workflow', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      // Step 1: Load image
      const loadPromise = waitForEvent(viewer, 'imageload');
      await viewer.loadImage(imageSrc);
      await loadPromise;
      
      // Step 2: Zoom in
      viewer.zoomTo(2.0);
      expect(viewer.getZoom()).toBe(2.0);
      
      // Step 3: Pan around
      viewer.setPan(100, 50);
      const pan = viewer.getPan();
      expect(pan.x).toBe(100);
      expect(pan.y).toBe(50);
      
      // Step 4: Reset view
      viewer.resetView();
      expect(viewer.getZoom()).toBe(1.0);
      const resetPan = viewer.getPan();
      expect(resetPan.x).toBe(0);
      expect(resetPan.y).toBe(0);
    });
  });

  describe('Annotation Workflow', () => {
    it('should complete full annotation workflow', async () => {
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      await viewer.loadImage(imageSrc);
      
      // Step 1: Activate rectangle tool
      viewer.activateTool('rect');
      expect(viewer.getActiveTool()).toBe('rect');
      
      // Step 2: Add annotation
      const annotation = {
        id: 'workflow-rect',
        type: 'rect',
        x: 100,
        y: 100,
        width: 200,
        height: 150
      };
      
      const addPromise = waitForEvent(viewer, 'annotationadd');
      viewer.addAnnotation(annotation);
      await addPromise;
      
      // Step 3: Verify annotation exists
      const annotations = viewer.getAnnotations();
      expect(annotations).toContain(annotation);
      
      // Step 4: Remove annotation
      const removePromise = waitForEvent(viewer, 'annotationremove');
      viewer.removeAnnotation(annotation.id);
      await removePromise;
      
      // Step 5: Verify annotation removed
      const remainingAnnotations = viewer.getAnnotations();
      expect(remainingAnnotations).not.toContain(annotation);
    });
  });

  describe('Comparison Workflow', () => {
    it('should complete comparison workflow', async () => {
      const beforeImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      const afterImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==';
      
      // Step 1: Load before image
      await viewer.loadImage(beforeImage);
      
      // Step 2: Set comparison image
      await viewer.setComparisonImage(afterImage);
      
      // Step 3: Toggle comparison mode
      viewer.toggleComparisonMode();
      
      // Step 4: Adjust comparison position
      viewer.setComparisonPosition(0.5);
      expect(viewer.getComparisonPosition()).toBe(0.5);
      
      // Step 5: Reset comparison
      viewer.setComparisonPosition(0);
      expect(viewer.getComparisonPosition()).toBe(0);
    });
  });
});
```

## Testing Tools

### 1. Jest Configuration

#### Jest Setup
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts',
    '<rootDir>/src/__tests__/**/*.test.tsx'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testTimeout: 10000
};
```

### 2. Testing Scripts

#### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest src/__tests__/unit",
    "test:integration": "jest src/__tests__/integration",
    "test:performance": "jest src/__tests__/performance",
    "test:visual": "jest src/__tests__/visual",
    "test:e2e": "jest src/__tests__/e2e",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### 3. CI/CD Integration

#### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    
    - run: npm run test:ci
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## Test Configuration

### 1. Environment Setup

#### Test Environment Variables
```bash
# .env.test
NODE_ENV=test
CANVAS_LENS_TEST_MODE=true
CANVAS_LENS_MOCK_CANVAS=true
```

#### Test Configuration
```typescript
// src/__tests__/config/test-config.ts
export const testConfig = {
  canvas: {
    width: 800,
    height: 600,
    mockContext: true
  },
  images: {
    testImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==',
    largeImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzAwMCIvPjwvc3ZnPg=='
  },
  performance: {
    fpsThreshold: 55,
    loadTimeThreshold: 1000,
    memoryThreshold: 10 * 1024 * 1024
  }
};
```

### 2. Mock Configuration

#### Canvas Mocking
```typescript
// src/__tests__/mocks/canvas-mock.ts
export class CanvasMock {
  width = 800;
  height = 600;
  
  getContext(type: string) {
    if (type === '2d') {
      return {
        clearRect: jest.fn(),
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        setTransform: jest.fn(),
        measureText: jest.fn(() => ({ width: 100 })),
        fillText: jest.fn(),
        strokeText: jest.fn(),
        createImageData: jest.fn(),
        getImageData: jest.fn(),
        putImageData: jest.fn(),
        canvas: this
      };
    }
    return null;
  }
  
  toDataURL() {
    return 'data:image/png;base64,test';
  }
  
  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      right: this.width,
      bottom: this.height,
      width: this.width,
      height: this.height
    };
  }
}
```

## Best Practices

### 1. Test Organization

#### Test Structure
```
src/__tests__/
├── setup.ts                 # Test setup
├── utils/                   # Test utilities
│   ├── test-utils.ts
│   └── mock-utils.ts
├── mocks/                   # Mock implementations
│   ├── canvas-mock.ts
│   └── image-mock.ts
├── unit/                    # Unit tests
│   ├── core/
│   ├── components/
│   └── utils/
├── integration/             # Integration tests
│   ├── component-integration/
│   └── module-integration/
├── performance/             # Performance tests
│   ├── rendering/
│   └── memory/
├── visual/                  # Visual tests
│   ├── canvas-output/
│   └── browser-compatibility/
└── e2e/                     # End-to-end tests
    ├── user-workflows/
    └── complete-scenarios/
```

### 2. Test Writing Guidelines

#### Test Naming
```typescript
// ✅ Good - Descriptive test names
describe('CanvasLens Image Loading', () => {
  it('should load image successfully with valid URL', () => {
    // test implementation
  });
  
  it('should handle image load errors gracefully', () => {
    // test implementation
  });
});

// ❌ Bad - Vague test names
describe('CanvasLens', () => {
  it('should work', () => {
    // test implementation
  });
});
```

#### Test Structure
```typescript
// ✅ Good - AAA pattern (Arrange, Act, Assert)
describe('Annotation Management', () => {
  it('should add annotation successfully', () => {
    // Arrange
    const viewer = createMockCanvasLens();
    const annotation = createMockAnnotation('rect');
    
    // Act
    viewer.addAnnotation(annotation);
    
    // Assert
    expect(viewer.getAnnotations()).toContain(annotation);
  });
});
```

#### Test Isolation
```typescript
// ✅ Good - Isolated tests
describe('Zoom Operations', () => {
  let viewer: CanvasLens;
  
  beforeEach(() => {
    viewer = createMockCanvasLens();
  });
  
  afterEach(() => {
    cleanupMockCanvasLens(viewer);
  });
  
  it('should zoom to specified level', () => {
    viewer.zoomTo(2.0);
    expect(viewer.getZoom()).toBe(2.0);
  });
  
  it('should maintain zoom state', () => {
    viewer.zoomTo(1.5);
    expect(viewer.getZoom()).toBe(1.5);
  });
});
```

### 3. Performance Testing Guidelines

#### Performance Test Structure
```typescript
// ✅ Good - Performance test with thresholds
describe('Rendering Performance', () => {
  it('should maintain 60 FPS during zoom operations', async () => {
    const viewer = createMockCanvasLens();
    const startTime = performance.now();
    
    // Perform operations
    for (let i = 0; i < 60; i++) {
      viewer.zoomTo(1 + i * 0.01);
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    const endTime = performance.now();
    const fps = 60 / ((endTime - startTime) / 1000);
    
    expect(fps).toBeGreaterThan(55);
  });
});
```

#### Memory Testing
```typescript
// ✅ Good - Memory leak testing
describe('Memory Management', () => {
  it('should not leak memory during repeated operations', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Perform operations
    for (let i = 0; i < 100; i++) {
      const viewer = createMockCanvasLens();
      viewer.loadImage('test-image.jpg');
      cleanupMockCanvasLens(viewer);
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

This comprehensive testing guide provides a complete framework for testing CanvasLens at all levels, from unit tests to end-to-end testing. By following these guidelines and using the provided tools, you can ensure that CanvasLens is reliable, performant, and maintainable.
