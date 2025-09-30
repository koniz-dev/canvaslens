/**
 * Jest setup file for CanvasLens tests
 */
import '@testing-library/jest-dom';

// Mock Canvas API with minimal implementation
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
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
} as any));

// Mock Image constructor
global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 0;
  height = 0;
  naturalWidth = 0;
  naturalHeight = 0;

  constructor() {
    setTimeout(() => {
      if (this.src) {
        this.width = 800;
        this.height = 600;
        this.naturalWidth = 800;
        this.naturalHeight = 600;
        this.onload?.();
      }
    }, 0);
  }
} as any;

// Mock FileReader
global.FileReader = class {
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  result: string | null = null;

  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,test';
      this.onload?.({ target: this });
    }, 0);
  }
} as any;

// Mock File constructor
global.File = class {
  name: string;
  type: string;
  size: number;

  constructor(chunks: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.type = options.type || '';
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  }
} as any;

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = class {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = class {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
} as any;

// Suppress console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Invalid tools configuration')
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};