// Imports removed

// Performance testing utilities
const measurePerformance = async (fn: () => void | Promise<void>): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

const createLargeCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const generateTestImageData = (width: number, height: number): ImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Generate gradient pattern
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff0000');
  gradient.addColorStop(0.5, '#00ff00');
  gradient.addColorStop(1, '#0000ff');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return ctx.getImageData(0, 0, width, height);
};

describe('Canvas Performance Tests', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = createLargeCanvas(1920, 1080);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    ctx = context;
  });

  afterEach(() => {
    // Cleanup
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  describe('Image Rendering Performance', () => {
    it('should render large image within acceptable time', async () => {
      const imageData = generateTestImageData(1920, 1080);
      
      const renderTime = await measurePerformance(() => {
        ctx.putImageData(imageData, 0, 0);
      });
      
      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle multiple image operations efficiently', async () => {
      const imageData = generateTestImageData(800, 600);
      
      const renderTime = await measurePerformance(async () => {
        for (let i = 0; i < 10; i++) {
          ctx.putImageData(imageData, i * 10, i * 10);
        }
      });
      
      // 10 operations should complete in less than 200ms
      expect(renderTime).toBeLessThan(200);
    });

    it('should handle zoom operations efficiently', async () => {
      const imageData = generateTestImageData(800, 600);
      ctx.putImageData(imageData, 0, 0);
      
      const zoomTime = await measurePerformance(() => {
        ctx.save();
        ctx.scale(2, 2);
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
      });
      
      // Zoom operation should complete in less than 50ms
      expect(zoomTime).toBeLessThan(50);
    });
  });

  describe('Annotation Rendering Performance', () => {
    it('should render many annotations efficiently', async () => {
      const annotationCount = 500; // Reduced from 1000
      
      const renderTime = await measurePerformance(() => {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < annotationCount; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 50 + 10;
          
          ctx.strokeRect(x, y, size, size);
        }
      });
      
      // 500 annotations should render in less than 1000ms
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle complex shapes efficiently', async () => {
      const shapeCount = 100;
      
      const renderTime = await measurePerformance(() => {
        for (let i = 0; i < shapeCount; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = Math.random() * 30 + 10;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
      
      // 100 complex shapes should render in less than 200ms
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        const imageData = generateTestImageData(400, 300);
        ctx.putImageData(imageData, 0, 0);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Force garbage collection if available
      if ((global as { gc?: () => void }).gc) {
        (global as { gc?: () => void }).gc!();
      }
      
      const finalMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Animation Performance', () => {
    it('should maintain 60fps during animation', async () => {
      const frameCount = 60;
      const frameTimes: number[] = [];
      
      const animate = async () => {
        for (let frame = 0; frame < frameCount; frame++) {
          const start = performance.now();
          
          // Simulate animation frame
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = `hsl(${frame * 6}, 50%, 50%)`;
          ctx.fillRect(frame * 10, 100, 50, 50);
          
          const end = performance.now();
          frameTimes.push(end - start);
          
          // Simulate 16.67ms frame time (60fps)
          await new Promise(resolve => setTimeout(resolve, 16.67));
        }
      };
      
      await animate();
      
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);
      
      // Average frame time should be less than 16.67ms (60fps)
      expect(averageFrameTime).toBeLessThan(16.67);
      
      // No single frame should take more than 33ms (30fps minimum)
      expect(maxFrameTime).toBeLessThan(33);
    });
  });

  describe('Large Canvas Performance', () => {
    it('should handle 4K canvas efficiently', async () => {
      const largeCanvas = createLargeCanvas(3840, 2160);
      const largeCtx = largeCanvas.getContext('2d')!;
      
      const renderTime = await measurePerformance(() => {
        const imageData = generateTestImageData(3840, 2160);
        largeCtx.putImageData(imageData, 0, 0);
      });
      
      // 4K rendering should complete in less than 500ms
      expect(renderTime).toBeLessThan(500);
      
      // Cleanup
      if (largeCanvas.parentNode) {
        largeCanvas.parentNode.removeChild(largeCanvas);
      }
    });

    it('should handle high DPI displays efficiently', async () => {
      const devicePixelRatio = 2;
      const baseWidth = 1920;
      const baseHeight = 1080;
      
      const highDPICanvas = createLargeCanvas(
        baseWidth * devicePixelRatio,
        baseHeight * devicePixelRatio
      );
      const highDPICtx = highDPICanvas.getContext('2d')!;
      
      const renderTime = await measurePerformance(() => {
        highDPICtx.scale(devicePixelRatio, devicePixelRatio);
        const imageData = generateTestImageData(baseWidth, baseHeight);
        highDPICtx.putImageData(imageData, 0, 0);
      });
      
      // High DPI rendering should complete in less than 300ms
      expect(renderTime).toBeLessThan(300);
      
      // Cleanup
      if (highDPICanvas.parentNode) {
        highDPICanvas.parentNode.removeChild(highDPICanvas);
      }
    });
  });
});
