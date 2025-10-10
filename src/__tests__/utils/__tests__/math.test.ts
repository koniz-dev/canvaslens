import { describe, it, expect } from '@jest/globals';

// Mock utility functions - replace with actual imports when available
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

const normalizeAngle = (angle: number): number => {
  while (angle < 0) angle += 2 * Math.PI;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
};

describe('Math Utilities', () => {
  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('should handle negative values', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
      expect(lerp(10, -10, 0.5)).toBe(0);
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      expect(distance(0, 0, 3, 4)).toBe(5);
      expect(distance(0, 0, 0, 0)).toBe(0);
      expect(distance(1, 1, 1, 1)).toBe(0);
    });

    it('should handle negative coordinates', () => {
      expect(distance(-1, -1, 1, 1)).toBeCloseTo(2.828, 2);
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angles to 0-2π range', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(Math.PI)).toBe(Math.PI);
      expect(normalizeAngle(2 * Math.PI)).toBe(0);
      expect(normalizeAngle(-Math.PI)).toBe(Math.PI);
      expect(normalizeAngle(3 * Math.PI)).toBe(Math.PI);
    });
  });
});
