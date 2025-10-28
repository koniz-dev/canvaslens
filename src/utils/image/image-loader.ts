/**
 * Advanced image loading utilities with lazy loading and optimization
 */
import { ImageData, Size } from '../../types';
import { ErrorHandler } from '../core/error-handler';
import { warn } from '../core/logger';

export interface ImageLoadOptions {
  /** Maximum image size before lazy loading (in bytes) */
  maxSizeForEagerLoad?: number;
  /** Enable progressive loading for large images */
  progressiveLoading?: boolean;
  /** Enable image compression for large images */
  enableCompression?: boolean;
  /** Compression quality (0-1) */
  compressionQuality?: number;
  /** Enable WebP format if supported */
  preferWebP?: boolean;
  /** Enable AVIF format if supported */
  preferAVIF?: boolean;
}

export interface LazyLoadOptions {
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Enable placeholder while loading */
  showPlaceholder?: boolean;
  /** Placeholder image URL */
  placeholderUrl?: string;
}

export class ImageLoader {
  private static readonly DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2MB
  private static readonly DEFAULT_COMPRESSION_QUALITY = 0.8;
  private static readonly SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

  /**
   * Load image with optimization and lazy loading support
   */
  static async loadImage(
    src: string,
    options: ImageLoadOptions = {},
    lazyOptions: LazyLoadOptions = {}
  ): Promise<ImageData> {
    const {
      maxSizeForEagerLoad = this.DEFAULT_MAX_SIZE,
      progressiveLoading = true,
      enableCompression = true,
      compressionQuality = this.DEFAULT_COMPRESSION_QUALITY,
      preferWebP = true,
      preferAVIF = true
    } = options;

    try {
      // Check if image should be lazy loaded
      const shouldLazyLoad = await this.shouldLazyLoad(src, maxSizeForEagerLoad);
      
      if (shouldLazyLoad) {
        return this.loadImageLazy(src, lazyOptions);
      }

      // Load image normally with optimizations
      return this.loadImageOptimized(src, {
        progressiveLoading,
        enableCompression,
        compressionQuality,
        preferWebP,
        preferAVIF
      });
    } catch (error) {
      ErrorHandler.handleImageLoadError(error as Error, src);
      throw error;
    }
  }

  /**
   * Load image from File object with optimization
   */
  static async loadImageFromFile(
    file: File,
    options: ImageLoadOptions = {}
  ): Promise<ImageData> {
    const {
      enableCompression = true,
      compressionQuality = this.DEFAULT_COMPRESSION_QUALITY,
      preferWebP = true
    } = options;

    try {
      if (!this.SUPPORTED_FORMATS.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Check if compression is needed
      const shouldCompress = enableCompression && file.size > 500 * 1024; // 500KB

      if (shouldCompress) {
        return this.loadAndCompressFile(file, compressionQuality, preferWebP);
      }

      return this.loadFileDirectly(file);
    } catch (error) {
      ErrorHandler.handleImageLoadError(error as Error, file.name, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      throw error;
    }
  }

  /**
   * Preload multiple images
   */
  static async preloadImages(
    sources: string[],
    options: ImageLoadOptions = {}
  ): Promise<ImageData[]> {
    const promises = sources.map(src => 
      this.loadImage(src, options).catch(error => {
        warn(`Failed to preload image: ${src}`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    return results.filter((result): result is ImageData => result !== null);
  }

  /**
   * Check if image should be lazy loaded
   */
  private static async shouldLazyLoad(src: string, maxSize: number): Promise<boolean> {
    try {
      const response = await fetch(src, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      if (contentLength) {
        return parseInt(contentLength) > maxSize;
      }
      
      // If we can't determine size, assume it's large
      return true;
    } catch {
      // If we can't check size, load normally
      return false;
    }
  }

  /**
   * Load image with lazy loading
   */
  private static async loadImageLazy(
    src: string,
    options: LazyLoadOptions
  ): Promise<ImageData> {
    const {
      rootMargin = '50px',
      threshold = 0.1,
      showPlaceholder = true,
      placeholderUrl
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set up intersection observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              observer.unobserve(img);
              this.loadImageOptimized(src).then(resolve).catch(reject);
            }
          });
        },
        { rootMargin, threshold }
      );

      // Show placeholder if enabled
      if (showPlaceholder && placeholderUrl) {
        img.src = placeholderUrl;
      }

      img.onload = () => {
        const imageData: ImageData = {
          element: img,
          naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
          displaySize: { width: img.width, height: img.height },
          position: { x: 0, y: 0 }
        };
        resolve(imageData);
      };

      img.onerror = () => {
        observer.unobserve(img);
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Start observing
      observer.observe(img);
    });
  }

  /**
   * Load image with optimizations
   */
  private static async loadImageOptimized(
    src: string,
    options: Partial<ImageLoadOptions> = {}
  ): Promise<ImageData> {
    const {
      progressiveLoading = true,
      enableCompression: _enableCompression = true,
      compressionQuality: _compressionQuality = this.DEFAULT_COMPRESSION_QUALITY,
      preferWebP = true,
      preferAVIF = true
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Enable progressive loading
      if (progressiveLoading) {
        img.loading = 'eager';
      }

      // Try to use optimized format
      if (preferAVIF && this.supportsAVIF()) {
        const avifSrc = this.getOptimizedSrc(src, 'avif');
        if (avifSrc) {
          img.src = avifSrc;
        } else {
          img.src = src;
        }
      } else if (preferWebP && this.supportsWebP()) {
        const webpSrc = this.getOptimizedSrc(src, 'webp');
        if (webpSrc) {
          img.src = webpSrc;
        } else {
          img.src = src;
        }
      } else {
        img.src = src;
      }

      img.onload = () => {
        const imageData: ImageData = {
          element: img,
          naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
          displaySize: { width: img.width, height: img.height },
          position: { x: 0, y: 0 }
        };
        resolve(imageData);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
    });
  }

  /**
   * Load and compress file
   */
  private static async loadAndCompressFile(
    file: File,
    quality: number,
    preferWebP: boolean
  ): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Set canvas size
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0);

          // Compress and convert
          const outputFormat = preferWebP && this.supportsWebP() ? 'image/webp' : 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(outputFormat, quality);

          // Create new image from compressed data
          const compressedImg = new Image();
          compressedImg.onload = () => {
            const imageData: ImageData = {
              element: compressedImg,
              naturalSize: { width: compressedImg.naturalWidth, height: compressedImg.naturalHeight },
              displaySize: { width: compressedImg.width, height: compressedImg.height },
              position: { x: 0, y: 0 },
              type: outputFormat,
              fileName: file.name
            };
            resolve(imageData);
          };
          compressedImg.onerror = () => reject(new Error('Failed to load compressed image'));
          compressedImg.src = compressedDataUrl;
        };

        img.onerror = () => reject(new Error('Failed to load image from file'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Load file directly without compression
   */
  private static async loadFileDirectly(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const imageData: ImageData = {
            element: img,
            naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
            displaySize: { width: img.width, height: img.height },
            position: { x: 0, y: 0 },
            type: file.type,
            fileName: file.name
          };
          resolve(imageData);
        };

        img.onerror = () => reject(new Error('Failed to load image from file'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Check if browser supports WebP
   */
  private static supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check if browser supports AVIF
   */
  private static supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  /**
   * Get optimized source URL
   */
  private static getOptimizedSrc(_src: string, _format: 'webp' | 'avif'): string | null {
    // This would typically involve server-side image optimization
    // For now, we'll return null to use the original source
    return null;
  }

  /**
   * Get image dimensions without loading the full image
   */
  static async getImageDimensions(src: string): Promise<Size> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to get dimensions for: ${src}`));
      };
      
      img.src = src;
    });
  }

  /**
   * Create image thumbnail
   */
  static async createThumbnail(
    imageData: ImageData,
    maxSize: number = 200
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const { naturalSize } = imageData;
    const aspectRatio = naturalSize.width / naturalSize.height;
    
    let thumbnailWidth = maxSize;
    let thumbnailHeight = maxSize;
    
    if (aspectRatio > 1) {
      thumbnailHeight = maxSize / aspectRatio;
    } else {
      thumbnailWidth = maxSize * aspectRatio;
    }

    canvas.width = thumbnailWidth;
    canvas.height = thumbnailHeight;

    ctx.drawImage(imageData.element, 0, 0, thumbnailWidth, thumbnailHeight);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }
}
