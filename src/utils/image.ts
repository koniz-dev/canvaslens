import { Size, Point, ImageData } from '../types';

/**
 * Calculate aspect ratio preserving dimensions to fit within container
 */
export function calculateFitDimensions(
  naturalSize: Size,
  containerSize: Size
): { displaySize: Size; position: Point } {
  const naturalAspectRatio = naturalSize.width / naturalSize.height;
  const containerAspectRatio = containerSize.width / containerSize.height;

  let displayWidth: number;
  let displayHeight: number;

  if (naturalAspectRatio > containerAspectRatio) {
    // Image is wider than container - fit to width
    displayWidth = containerSize.width;
    displayHeight = displayWidth / naturalAspectRatio;
  } else {
    // Image is taller than container - fit to height
    displayHeight = containerSize.height;
    displayWidth = displayHeight * naturalAspectRatio;
  }

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
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    
    img.src = url;
  });
}

/**
 * Get image data from loaded image
 */
export function getImageData(
  image: HTMLImageElement,
  containerSize: Size
): ImageData {
  const naturalSize: Size = {
    width: image.naturalWidth,
    height: image.naturalHeight
  };

  const { displaySize, position } = calculateFitDimensions(
    naturalSize,
    containerSize
  );

  return {
    element: image,
    naturalSize,
    displaySize,
    position
  };
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
