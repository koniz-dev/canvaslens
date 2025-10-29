import type { Size, Point, CustomImageData, Rectangle } from '../../types';

/**
 * Calculate aspect ratio preserving dimensions to fit within container
 * Only scales down (scale <= 1), never scales up to avoid image quality loss
 */
export function calculateFitDimensions(
  naturalSize: Size,
  containerSize: Size
): { displaySize: Size; position: Point } {
  const scaleX = containerSize.width / naturalSize.width;
  const scaleY = containerSize.height / naturalSize.height;
  
  const scale = Math.min(scaleX, scaleY, 1);

  const displayWidth = naturalSize.width * scale;
  const displayHeight = naturalSize.height * scale;

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
  // For overlay mode, don't scale - keep original size
  const scale = 1;

  const displayWidth = naturalSize.width * scale;
  const displayHeight = naturalSize.height * scale;

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
    img.onerror = (_error) => {
      // If CORS fails, try without CORS
      if (img.crossOrigin === 'anonymous') {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          resolve(fallbackImg);
        };
        fallbackImg.onerror = (_fallbackError) => {
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
): CustomImageData {
  const naturalSize: Size = {
    width: image.naturalWidth,
    height: image.naturalHeight
  };

  const { displaySize, position } = calculateFitDimensions(
    naturalSize,
    containerSize
  );

  const customImageData: CustomImageData = {
    element: image,
    naturalSize,
    displaySize,
    position
  };

  if (type) {
    customImageData.type = type;
  }

  if (fileName) {
    customImageData.fileName = fileName;
  }

  return customImageData;
}

/**
 * Get image data from loaded image for overlay mode (allows scaling up)
 */
export function getCustomImageDataOverlay(
  image: HTMLImageElement,
  containerSize: Size,
  type?: string,
  fileName?: string
): CustomImageData {
  const naturalSize: Size = {
    width: image.naturalWidth,
    height: image.naturalHeight
  };

  const { displaySize, position } = calculateFitDimensionsOverlay(
    naturalSize,
    containerSize
  );

  const customImageData: CustomImageData = {
    element: image,
    naturalSize,
    displaySize,
    position
  };

  if (type) {
    customImageData.type = type;
  }

  if (fileName) {
    customImageData.fileName = fileName;
  }

  return customImageData;
}

/**
 * Check if a point is inside a rectangle
 */
export function isPointInRect(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}
