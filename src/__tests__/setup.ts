import '@testing-library/jest-dom';

let mockDataURLCounter = 0;
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => {
  mockDataURLCounter++;
  return `data:image/png;base64,mock-image-data-${mockDataURLCounter}`;
});
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => ({
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  fillText: jest.fn(),
  transform: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  canvas: {} as HTMLCanvasElement,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  isPointInPath: jest.fn(() => false),
  isPointInStroke: jest.fn(() => false),
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'inherit',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
} as unknown as CanvasRenderingContext2D));

global.Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  width = 0;
  height = 0;
  
  constructor() {
    Promise.resolve().then(() => {
      if (this.src) {
        this.width = 800;
        this.height = 600;
        this.onload?.();
      } else {
        this.onerror?.();
      }
    });
  }
} as unknown as typeof Image;

global.ResizeObserver = class {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
} as unknown as typeof ResizeObserver;

global.IntersectionObserver = class {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
} as unknown as typeof IntersectionObserver;

global.requestAnimationFrame = jest.fn((cb) => {
  const timer = setTimeout(cb, 16);
  return timer as number;
});
global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

global.performance = {
  now: jest.fn(() => Date.now()),
} as unknown as Performance;

const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Only use fake timers for specific tests that need them
// beforeEach(() => {
//   jest.useFakeTimers();
// });

afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});

afterAll(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});
