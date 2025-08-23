import { AdjustmentValue, ColorAdjustment } from './types';

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Apply adjustments to image data
   */
  applyAdjustments(imageData: ImageData, adjustments: AdjustmentValue): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const resultData = result.data;

    // Copy original data
    for (let i = 0; i < data.length; i++) {
      resultData[i] = data[i] || 0;
    }

    // Apply brightness
    if (adjustments.brightness !== 0) {
      this.applyBrightness(resultData, adjustments.brightness);
    }

    // Apply contrast
    if (adjustments.contrast !== 0) {
      this.applyContrast(resultData, adjustments.contrast);
    }

    // Apply exposure
    if (adjustments.exposure !== 0) {
      this.applyExposure(resultData, adjustments.exposure);
    }

    // Apply highlights
    if (adjustments.highlights !== 0) {
      this.applyHighlights(resultData, adjustments.highlights);
    }

    // Apply shadows
    if (adjustments.shadows !== 0) {
      this.applyShadows(resultData, adjustments.shadows);
    }

    // Apply vignette
    if (adjustments.vignette !== 0) {
      this.applyVignette(resultData, width, height, adjustments.vignette);
    }

    return result;
  }

  /**
   * Apply color adjustments
   */
  applyColorAdjustments(imageData: ImageData, colorAdjustments: ColorAdjustment): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const resultData = result.data;

    // Copy original data
    for (let i = 0; i < data.length; i++) {
      resultData[i] = data[i] || 0;
    }

    // Apply saturation
    if (colorAdjustments.saturation !== 0) {
      this.applySaturation(resultData, colorAdjustments.saturation);
    }

    // Apply temperature
    if (colorAdjustments.temperature !== 0) {
      this.applyTemperature(resultData, colorAdjustments.temperature);
    }

    // Apply tint
    if (colorAdjustments.tint !== 0) {
      this.applyTint(resultData, colorAdjustments.tint);
    }

    // Apply vibrance
    if (colorAdjustments.vibrance !== 0) {
      this.applyVibrance(resultData, colorAdjustments.vibrance);
    }

    return result;
  }

  private applyBrightness(data: Uint8ClampedArray, value: number): void {
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] || 0) * factor));     // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] || 0) * factor)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] || 0) * factor)); // B
    }
  }

  private applyContrast(data: Uint8ClampedArray, value: number): void {
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * ((data[i] || 0) - 128) + 128));     // R
      data[i + 1] = Math.min(255, Math.max(0, factor * ((data[i + 1] || 0) - 128) + 128)); // G
      data[i + 2] = Math.min(255, Math.max(0, factor * ((data[i + 2] || 0) - 128) + 128)); // B
    }
  }

  private applyExposure(data: Uint8ClampedArray, value: number): void {
    const factor = Math.pow(2, value / 100);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] || 0) * factor));     // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] || 0) * factor)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] || 0) * factor)); // B
    }
  }

  private applyHighlights(data: Uint8ClampedArray, value: number): void {
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
      const avg = ((data[i] || 0) + (data[i + 1] || 0) + (data[i + 2] || 0)) / 3;
      if (avg > 128) {
        data[i] = Math.min(255, Math.max(0, (data[i] || 0) * factor));     // R
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] || 0) * factor)); // G
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] || 0) * factor)); // B
      }
    }
  }

  private applyShadows(data: Uint8ClampedArray, value: number): void {
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
      const avg = ((data[i] || 0) + (data[i + 1] || 0) + (data[i + 2] || 0)) / 3;
      if (avg < 128) {
        data[i] = Math.min(255, Math.max(0, (data[i] || 0) * factor));     // R
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] || 0) * factor)); // G
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] || 0) * factor)); // B
      }
    }
  }

  private applyVignette(data: Uint8ClampedArray, width: number, height: number, value: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const intensity = value / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const factor = 1 - (distance / maxDistance) * intensity;
        
        const index = (y * width + x) * 4;
        data[index] = Math.min(255, Math.max(0, (data[index] || 0) * factor));     // R
        data[index + 1] = Math.min(255, Math.max(0, (data[index + 1] || 0) * factor)); // G
        data[index + 2] = Math.min(255, Math.max(0, (data[index + 2] || 0) * factor)); // B
      }
    }
  }

  private applySaturation(data: Uint8ClampedArray, value: number): void {
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0);
      data[i] = Math.min(255, Math.max(0, gray + factor * ((data[i] || 0) - gray)));     // R
      data[i + 1] = Math.min(255, Math.max(0, gray + factor * ((data[i + 1] || 0) - gray))); // G
      data[i + 2] = Math.min(255, Math.max(0, gray + factor * ((data[i + 2] || 0) - gray))); // B
    }
  }

  private applyTemperature(data: Uint8ClampedArray, value: number): void {
    const factor = value / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] || 0) + factor * 20));     // R (warm)
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] || 0) - factor * 20)); // B (cool)
    }
  }

  private applyTint(data: Uint8ClampedArray, value: number): void {
    const factor = value / 100;
    for (let i = 0; i < data.length; i += 4) {
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] || 0) + factor * 20)); // G (green/magenta)
    }
  }

  private applyVibrance(data: Uint8ClampedArray, value: number): void {
    const factor = 1 + value / 100;
    for (let i = 0; i < data.length; i += 4) {
      const max = Math.max(data[i] || 0, data[i + 1] || 0, data[i + 2] || 0);
      const min = Math.min(data[i] || 0, data[i + 1] || 0, data[i + 2] || 0);
      const saturation = max - min;
      
      if (saturation > 0) {
        data[i] = Math.min(255, Math.max(0, (data[i] || 0) + (max - (data[i] || 0)) * (factor - 1)));     // R
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] || 0) + (max - (data[i + 1] || 0)) * (factor - 1))); // G
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] || 0) + (max - (data[i + 2] || 0)) * (factor - 1))); // B
      }
    }
  }
}
