import {
  screenToWorld,
  worldToScreen,
  distance,
  centerPoint,
  clamp
} from '../../../src/utils/coordinate';
import { Point, ViewState } from '../../../src/types';

describe('Coordinate Utilities', () => {
  describe('screenToWorld', () => {
    it('should convert screen coordinates to world coordinates', () => {
      const screenPoint: Point = { x: 100, y: 50 };
      const viewState: ViewState = {
        scale: 2,
        offsetX: 10,
        offsetY: 20
      };

      const result = screenToWorld(screenPoint, viewState);

      expect(result).toEqual({
        x: (100 - 10) / 2, // 45
        y: (50 - 20) / 2   // 15
      });
    });

    it('should handle zero scale', () => {
      const screenPoint: Point = { x: 100, y: 50 };
      const viewState: ViewState = {
        scale: 0,
        offsetX: 10,
        offsetY: 20
      };

      const result = screenToWorld(screenPoint, viewState);

      expect(result).toEqual({
        x: Infinity,
        y: Infinity
      });
    });
  });

  describe('worldToScreen', () => {
    it('should convert world coordinates to screen coordinates', () => {
      const worldPoint: Point = { x: 45, y: 15 };
      const viewState: ViewState = {
        scale: 2,
        offsetX: 10,
        offsetY: 20
      };

      const result = worldToScreen(worldPoint, viewState);

      expect(result).toEqual({
        x: 45 * 2 + 10, // 100
        y: 15 * 2 + 20  // 50
      });
    });

    it('should handle zero scale', () => {
      const worldPoint: Point = { x: 45, y: 15 };
      const viewState: ViewState = {
        scale: 0,
        offsetX: 10,
        offsetY: 20
      };

      const result = worldToScreen(worldPoint, viewState);

      expect(result).toEqual({
        x: 10,
        y: 20
      });
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };

      const result = distance(p1, p2);

      expect(result).toBe(5); // 3-4-5 triangle
    });

    it('should return 0 for same points', () => {
      const p1: Point = { x: 5, y: 5 };
      const p2: Point = { x: 5, y: 5 };

      const result = distance(p1, p2);

      expect(result).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const p1: Point = { x: -3, y: -4 };
      const p2: Point = { x: 0, y: 0 };

      const result = distance(p1, p2);

      expect(result).toBe(5);
    });
  });

  describe('centerPoint', () => {
    it('should calculate center point between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 10, y: 10 };

      const result = centerPoint(p1, p2);

      expect(result).toEqual({ x: 5, y: 5 });
    });

    it('should handle negative coordinates', () => {
      const p1: Point = { x: -10, y: -5 };
      const p2: Point = { x: 10, y: 5 };

      const result = centerPoint(p1, p2);

      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('should handle reversed min/max', () => {
      expect(clamp(5, 10, 0)).toBe(0); // When min > max, clamp should use min as the upper bound
    });
  });
});
