// Test setup file for Jest
import '@testing-library/jest-dom';

// Mock canvas for testing
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4) })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  })),
});

// Mock Image constructor
global.Image = class {
  onload?: (event?: Event) => void;
  onerror?: (event?: Event) => void;
  
  constructor() {
    setTimeout(() => {
      this.onload?.();
    }, 0);
  }
} as any;

// Mock Touch constructor for touch events
global.Touch = class {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  radiusX: number;
  radiusY: number;
  rotationAngle: number;
  force: number;

  constructor(init: any) {
    this.identifier = init.identifier;
    this.target = init.target;
    this.clientX = init.clientX;
    this.clientY = init.clientY;
    this.pageX = init.pageX;
    this.pageY = init.pageY;
    this.radiusX = init.radiusX ?? 1;
    this.radiusY = init.radiusY ?? 1;
    this.rotationAngle = init.rotationAngle ?? 0;
    this.force = init.force ?? 1;
  }
} as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test cleanup
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear any pending animation frames
  if (typeof cancelAnimationFrame !== 'undefined') {
    // Cancel any pending animation frames
    for (let i = 1; i < 1000; i++) {
      cancelAnimationFrame(i);
    }
  }
  
  // Clear any pending timeouts
  if (typeof clearTimeout !== 'undefined') {
    for (let i = 1; i < 1000; i++) {
      clearTimeout(i);
    }
  }
});
