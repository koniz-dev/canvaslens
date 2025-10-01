import { Size, Point, ImageData } from '../../types';

/**
 * Calculate aspect ratio preserving dimensions to fit within container
 * Only scales down (scale <= 1), never scales up to avoid image quality loss
 */
export function calculateFitDimensions(
  naturalSize: Size,
  containerSize: Size
): { displaySize: Size; position: Point } {
  const naturalAspectRatio = naturalSize.width / naturalSize.height;
  const containerAspectRatio = containerSize.width / containerSize.height;

  let displayWidth: number;
  let displayHeight: number;

  // Calculate scale factors for both dimensions
  const scaleX = containerSize.width / naturalSize.width;
  const scaleY = containerSize.height / naturalSize.height;
  
  // Use the smaller scale factor to ensure image fits within container
  // But don't scale up (scale > 1) - only scale down (scale <= 1)
  const scale = Math.min(scaleX, scaleY, 1);

  displayWidth = naturalSize.width * scale;
  displayHeight = naturalSize.height * scale;

  const position: Point = {
    x: (containerSize.width - displayWidth) / 2,
    y: (containerSize.height - displayHeight) / 2
  };

  return {
    displaySize: { width: displayWidth, height: displayHeight },
    position
  };
}

/**
 * Calculate aspect ratio preserving dimensions to fit within container
 * Allows scaling up for overlay mode to use full container space
 */
export function calculateFitDimensionsOverlay(
  naturalSize: Size,
  containerSize: Size
): { displaySize: Size; position: Point } {
  const naturalAspectRatio = naturalSize.width / naturalSize.height;
  const containerAspectRatio = containerSize.width / containerSize.height;

  let displayWidth: number;
  let displayHeight: number;

  // Calculate scale factors for both dimensions
  const scaleX = containerSize.width / naturalSize.width;
  const scaleY = containerSize.height / naturalSize.height;
  
  // For overlay mode, don't scale - keep original size
  const scale = 1;

  displayWidth = naturalSize.width * scale;
  displayHeight = naturalSize.height * scale;

  const position: Point = {
    x: (containerSize.width - displayWidth) / 2,
    y: (containerSize.height - displayHeight) / 2
  };

  return {
    displaySize: { width: displayWidth, height: displayHeight },
    position
  };
}

/**
 * Load image from URL and return a promise
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Try with CORS first, fallback to no CORS if it fails
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = (error) => {
      // If CORS fails, try without CORS
      if (img.crossOrigin === 'anonymous') {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          resolve(fallbackImg);
        };
        fallbackImg.onerror = (fallbackError) => {
          reject(new Error(`Failed to load image: ${url}`));
        };
        fallbackImg.src = url;
      } else {
        reject(new Error(`Failed to load image: ${url}`));
      }
    };
    
    img.src = url;
  });
}

/**
 * Get image data from loaded image
 */
export function getImageData(
  image: HTMLImageElement,
  containerSize: Size,
  type?: string,
  fileName?: string
): ImageData {
  const naturalSize: Size = {
    width: image.naturalWidth,
    height: image.naturalHeight
  };

  const { displaySize, position } = calculateFitDimensions(
    naturalSize,
    containerSize
  );

  const imageData: ImageData = {
    element: image,
    naturalSize,
    displaySize,
    position
  };

  if (type) {
    imageData.type = type;
  }

  if (fileName) {
    imageData.fileName = fileName;
  }

  return imageData;
}

/**
 * Get image data from loaded image for overlay mode (allows scaling up)
 */
export function getImageDataOverlay(
  image: HTMLImageElement,
  containerSize: Size,
  type?: string,
  fileName?: string
): ImageData {
  const naturalSize: Size = {
    width: image.naturalWidth,
    height: image.naturalHeight
  };

  const { displaySize, position } = calculateFitDimensionsOverlay(
    naturalSize,
    containerSize
  );

  const imageData: ImageData = {
    element: image,
    naturalSize,
    displaySize,
    position
  };

  if (type) {
    imageData.type = type;
  }

  if (fileName) {
    imageData.fileName = fileName;
  }

  return imageData;
}

/**
 * Check if a point is inside a rectangle
 */
export function isPointInRect(point: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}
