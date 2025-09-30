/**
 * Unit tests for CanvasLensCore
 */
import { CanvasLensCore } from '../components/CanvasLensCore';
import { Engine } from '../core/Engine';

// Mock dependencies
jest.mock('../core/Engine');
jest.mock('../components/AttributeParser');
jest.mock('../components/EventManager');
jest.mock('../components/OverlayManager');

describe('CanvasLensCore', () => {
  let mockElement: HTMLElement;
  let mockShadowRoot: ShadowRoot;
  let canvasLensCore: CanvasLensCore;
  let mockEngine: jest.Mocked<Engine>;

  beforeEach(() => {
    // Create mock element with shadow root
    mockElement = document.createElement('div');
    mockShadowRoot = {
      firstElementChild: document.createElement('div'),
      appendChild: jest.fn()
    } as any;
    
    Object.defineProperty(mockElement, 'shadowRoot', {
      value: mockShadowRoot,
      writable: true
    });

    // Mock Engine
    mockEngine = {
      loadImage: jest.fn(),
      resize: jest.fn(),
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      zoomTo: jest.fn(),
      fitToView: jest.fn(),
      resetView: jest.fn(),
      activateTool: jest.fn(),
      deactivateTool: jest.fn(),
      getActiveTool: jest.fn(),
      addAnnotation: jest.fn(),
      removeAnnotation: jest.fn(),
      clearAnnotations: jest.fn(),
      getAnnotations: jest.fn(),
      setEventHandlers: jest.fn(),
      getImageData: jest.fn(),
      isImageLoaded: jest.fn(),
      getZoomLevel: jest.fn(),
      getPanOffset: jest.fn(),
      destroy: jest.fn(),
      updateToolConfig: jest.fn(),
      loadImageElement: jest.fn()
    } as any;

    (Engine as jest.MockedClass<typeof Engine>).mockImplementation(() => mockEngine);

    canvasLensCore = new CanvasLensCore(mockElement);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(() => canvasLensCore.initialize()).not.toThrow();
      expect(Engine).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', () => {
      (Engine as jest.MockedClass<typeof Engine>).mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      expect(() => canvasLensCore.initialize()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('should destroy resources and set destroyed flag', () => {
      canvasLensCore.initialize();
      canvasLensCore.destroy();

      expect(mockEngine.destroy).toHaveBeenCalled();
    });

    it('should not destroy if already destroyed', () => {
      canvasLensCore.destroy();
      canvasLensCore.destroy();

      expect(mockEngine.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadImage', () => {
    beforeEach(() => {
      canvasLensCore.initialize();
    });

    it('should load image successfully', async () => {
      mockEngine.loadImage.mockResolvedValue(undefined);

      await expect(canvasLensCore.loadImage('test.jpg')).resolves.toBeUndefined();
      expect(mockEngine.loadImage).toHaveBeenCalledWith('test.jpg', undefined, undefined);
    });

    it('should handle load image errors', async () => {
      const error = new Error('Load failed');
      mockEngine.loadImage.mockRejectedValue(error);

      await expect(canvasLensCore.loadImage('test.jpg')).rejects.toThrow('Load failed');
    });

    it('should throw error if not initialized', async () => {
      canvasLensCore.destroy();

      await expect(canvasLensCore.loadImage('test.jpg')).rejects.toThrow('CanvasLens is not initialized');
    });
  });

  describe('loadImageFromFile', () => {
    beforeEach(() => {
      canvasLensCore.initialize();
    });

    it('should load image from file successfully', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        onerror: null as any
      };

      // Mock FileReader
      global.FileReader = jest.fn(() => mockReader) as any;

      canvasLensCore.loadImageFromFile(mockFile);

      expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('should reject non-image files', () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });

      canvasLensCore.loadImageFromFile(mockFile);

      expect(mockEngine.loadImageElement).not.toHaveBeenCalled();
    });

    it('should handle error if not initialized', () => {
      canvasLensCore.destroy();
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      expect(() => canvasLensCore.loadImageFromFile(mockFile)).not.toThrow();
    });
  });

  describe('zoom controls', () => {
    beforeEach(() => {
      canvasLensCore.initialize();
    });

    it('should call zoom methods on engine', () => {
      canvasLensCore.zoomIn(1.5);
      expect(mockEngine.zoomIn).toHaveBeenCalledWith(1.5);

      canvasLensCore.zoomOut(1.2);
      expect(mockEngine.zoomOut).toHaveBeenCalledWith(1.2);

      canvasLensCore.zoomTo(2.0);
      expect(mockEngine.zoomTo).toHaveBeenCalledWith(2.0);

      canvasLensCore.fitToView();
      expect(mockEngine.fitToView).toHaveBeenCalled();

      canvasLensCore.resetView();
      expect(mockEngine.resetView).toHaveBeenCalled();
    });
  });

  describe('tool controls', () => {
    beforeEach(() => {
      canvasLensCore.initialize();
    });

    it('should activate tool', () => {
      mockEngine.activateTool.mockReturnValue(true);

      const result = canvasLensCore.activateTool('rect');
      expect(result).toBe(true);
      expect(mockEngine.activateTool).toHaveBeenCalledWith('rect');
    });

    it('should deactivate tool', () => {
      mockEngine.deactivateTool.mockReturnValue(true);

      const result = canvasLensCore.deactivateTool();
      expect(result).toBe(true);
      expect(mockEngine.deactivateTool).toHaveBeenCalled();
    });

    it('should get active tool', () => {
      mockEngine.getActiveTool.mockReturnValue('rect');

      const result = canvasLensCore.getActiveTool();
      expect(result).toBe('rect');
      expect(mockEngine.getActiveTool).toHaveBeenCalled();
    });
  });

  describe('annotation controls', () => {
    beforeEach(() => {
      canvasLensCore.initialize();
    });

    it('should add annotation', () => {
      const annotation = { id: '1', type: 'rect' as const, points: [], style: { strokeColor: '#ff0000', strokeWidth: 2 } };

      canvasLensCore.addAnnotation(annotation);

      expect(mockEngine.addAnnotation).toHaveBeenCalledWith(annotation);
      expect(canvasLensCore.hasChanges()).toBe(true);
    });

    it('should remove annotation', () => {
      canvasLensCore.removeAnnotation('1');

      expect(mockEngine.removeAnnotation).toHaveBeenCalledWith('1');
      expect(canvasLensCore.hasChanges()).toBe(true);
    });

    it('should clear annotations', () => {
      canvasLensCore.clearAnnotations();

      expect(mockEngine.clearAnnotations).toHaveBeenCalled();
      expect(canvasLensCore.hasChanges()).toBe(true);
    });

    it('should get annotations', () => {
      const annotations = [{ id: '1', type: 'rect' }];
      mockEngine.getAnnotations.mockReturnValue(annotations);

      const result = canvasLensCore.getAnnotations();
      expect(result).toEqual(annotations);
    });
  });

  describe('state queries', () => {
    beforeEach(() => {
      canvasLensCore.initialize();
    });

    it('should check if image is loaded', () => {
      mockEngine.isImageLoaded.mockReturnValue(true);

      const result = canvasLensCore.isImageLoaded();
      expect(result).toBe(true);
    });

    it('should get image data', () => {
      const imageData = { element: {} as HTMLImageElement, naturalSize: { width: 100, height: 100 } };
      mockEngine.getImageData.mockReturnValue(imageData);

      const result = canvasLensCore.getImageData();
      expect(result).toEqual(imageData);
    });

    it('should get zoom level', () => {
      mockEngine.getZoomLevel.mockReturnValue(2.5);

      const result = canvasLensCore.getZoomLevel();
      expect(result).toBe(2.5);
    });

    it('should get pan offset', () => {
      const panOffset = { x: 100, y: 50 };
      mockEngine.getPanOffset.mockReturnValue(panOffset);

      const result = canvasLensCore.getPanOffset();
      expect(result).toEqual(panOffset);
    });
  });

  describe('error handling', () => {
    it('should handle attribute change errors gracefully', () => {
      canvasLensCore.initialize();
      
      // Mock console.error to avoid test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // This should not throw even if there's an error
      expect(() => canvasLensCore.handleAttributeChange('invalid', 'value')).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
});
