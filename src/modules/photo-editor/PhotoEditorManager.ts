import { PhotoEditorOptions, PhotoEditorState, PhotoEditorTool, AdjustmentValue, ColorAdjustment } from './types';
import { ImageProcessor } from './ImageProcessor';

export class PhotoEditorManager {
  private options: PhotoEditorOptions;
  private state: PhotoEditorState;
  private imageProcessor: ImageProcessor;
  private onStateChange?: (state: PhotoEditorState) => void;
  private onImageUpdate?: (imageData: ImageData) => void;

  constructor(options: PhotoEditorOptions = {}) {
    this.options = {
      enabled: true,
      tools: ['light', 'color', 'retouching', 'effects', 'info'],
      defaultTool: 'light',
      theme: 'dark',
      position: 'right',
      width: 300,
      height: 600,
      ...options
    };

    this.state = {
      isOpen: false,
      currentTool: this.options.defaultTool!,
      adjustments: {
        brightness: 0,
        exposure: 0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
        vignette: 0
      },
      colorAdjustments: {
        saturation: 0,
        temperature: 0,
        tint: 0,
        vibrance: 0
      },
      originalImageData: null,
      modifiedImageData: null
    };

    this.imageProcessor = new ImageProcessor();
  }

  /**
   * Set callbacks for state changes and image updates
   */
  setCallbacks(onStateChange?: (state: PhotoEditorState) => void, onImageUpdate?: (imageData: ImageData) => void): void {
    this.onStateChange = onStateChange || (() => {});
    this.onImageUpdate = onImageUpdate || (() => {});
  }

  /**
   * Open photo editor
   */
  open(): void {
    this.state.isOpen = true;
    this.notifyStateChange();
  }

  /**
   * Close photo editor
   */
  close(): void {
    this.state.isOpen = false;
    this.notifyStateChange();
  }

  /**
   * Toggle photo editor
   */
  toggle(): void {
    this.state.isOpen = !this.state.isOpen;
    this.notifyStateChange();
  }

  /**
   * Set current tool
   */
  setTool(tool: PhotoEditorTool): void {
    this.state.currentTool = tool;
    this.notifyStateChange();
  }

  /**
   * Update adjustment value
   */
  updateAdjustment(key: keyof AdjustmentValue, value: number): void {
    this.state.adjustments[key] = value;
    this.processImage();
    this.notifyStateChange();
  }

  /**
   * Update color adjustment value
   */
  updateColorAdjustment(key: keyof ColorAdjustment, value: number): void {
    this.state.colorAdjustments[key] = value;
    this.processImage();
    this.notifyStateChange();
  }

  /**
   * Set original image data
   */
  setOriginalImage(imageData: ImageData): void {
    this.state.originalImageData = imageData;
    this.processImage();
    this.notifyStateChange();
  }

  /**
   * Reset all adjustments
   */
  reset(): void {
    this.state.adjustments = {
      brightness: 0,
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      vignette: 0
    };
    this.state.colorAdjustments = {
      saturation: 0,
      temperature: 0,
      tint: 0,
      vibrance: 0
    };
    this.processImage();
    this.notifyStateChange();
  }

  /**
   * Get current state
   */
  getState(): PhotoEditorState {
    return { ...this.state };
  }

  /**
   * Get options
   */
  getOptions(): PhotoEditorOptions {
    return { ...this.options };
  }

  /**
   * Process image with current adjustments
   */
  private processImage(): void {
    if (!this.state.originalImageData) return;

    let processedImageData = this.state.originalImageData;

    // Apply light adjustments
    processedImageData = this.imageProcessor.applyAdjustments(processedImageData, this.state.adjustments);

    // Apply color adjustments
    processedImageData = this.imageProcessor.applyColorAdjustments(processedImageData, this.state.colorAdjustments);

    this.state.modifiedImageData = processedImageData;

    // Notify image update
    if (this.onImageUpdate) {
      this.onImageUpdate(processedImageData);
    }
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * Get tool configurations
   */
  getToolConfigs() {
    return [
      {
        id: 'light' as PhotoEditorTool,
        name: 'Light',
        icon: '☀️',
        adjustments: ['brightness', 'exposure', 'contrast', 'highlights', 'shadows', 'vignette']
      },
      {
        id: 'color' as PhotoEditorTool,
        name: 'Color',
        icon: '🎨',
        adjustments: ['saturation', 'temperature', 'tint', 'vibrance']
      },
      {
        id: 'retouching' as PhotoEditorTool,
        name: 'Retouching',
        icon: '🩹',
        adjustments: []
      },
      {
        id: 'effects' as PhotoEditorTool,
        name: 'Effects',
        icon: '✨',
        adjustments: []
      },
      {
        id: 'info' as PhotoEditorTool,
        name: 'Info',
        icon: 'ℹ️',
        adjustments: []
      }
    ];
  }

  /**
   * Get slider configurations for current tool
   */
  getSliderConfigs() {
    const toolConfigs = {
      light: [
        { id: 'brightness', name: 'Brightness', min: -100, max: 100, step: 1, defaultValue: 0, icon: '☀️' },
        { id: 'exposure', name: 'Exposure', min: -100, max: 100, step: 1, defaultValue: 0, icon: '⚡' },
        { id: 'contrast', name: 'Contrast', min: -100, max: 100, step: 1, defaultValue: 0, icon: '🌙' },
        { id: 'highlights', name: 'Highlights', min: -100, max: 100, step: 1, defaultValue: 0, icon: '🔆' },
        { id: 'shadows', name: 'Shadows', min: -100, max: 100, step: 1, defaultValue: 0, icon: '🌑' },
        { id: 'vignette', name: 'Vignette', min: -100, max: 100, step: 1, defaultValue: 0, icon: '⭕' }
      ],
      color: [
        { id: 'saturation', name: 'Saturation', min: -100, max: 100, step: 1, defaultValue: 0, icon: '🌈' },
        { id: 'temperature', name: 'Temperature', min: -100, max: 100, step: 1, defaultValue: 0, icon: '🌡️' },
        { id: 'tint', name: 'Tint', min: -100, max: 100, step: 1, defaultValue: 0, icon: '🎭' },
        { id: 'vibrance', name: 'Vibrance', min: -100, max: 100, step: 1, defaultValue: 0, icon: '💎' }
      ],
      retouching: [],
      effects: [],
      info: []
    };

    return toolConfigs[this.state.currentTool] || [];
  }
}
