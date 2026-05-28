import type { CanvasLensOptions } from '../types';
import { SecureJsonParser } from '../utils/security/secure-json-parser';

/**
 * Parses Web Component attributes into structured options that App can
 * consume. Replaces the v1 `AttributeParser` (kept for backward compat)
 * with a slightly cleaner API.
 *
 * Naming: it's an "input binder" because in Phase 7+ we plan to also
 * forward attribute mutations into the store as dispatches.
 */
export interface ParsedAttributes {
  width: number;
  height: number;
  backgroundColor: string;
  maxZoom: number;
  minZoom: number;
  tools?: CanvasLensOptions['tools'];
}

const MAX_SIZE = 100_000;

export class AttributeBinder {
  /** Build initial AppOptions input from an element's attributes. */
  static read(element: HTMLElement, container: HTMLElement): CanvasLensOptions {
    const tools = AttributeBinder.parseTools(element.getAttribute('tools'));
    const result: CanvasLensOptions = {
      container,
      width: AttributeBinder.parseSize(element.getAttribute('width'), 800),
      height: AttributeBinder.parseSize(element.getAttribute('height'), 600),
      backgroundColor: element.getAttribute('background-color') ?? '#f0f0f0',
      maxZoom: AttributeBinder.parseNumber(element.getAttribute('max-zoom'), 10),
      minZoom: AttributeBinder.parseNumber(element.getAttribute('min-zoom'), 0.1)
    };
    if (tools) result.tools = tools;
    return result;
  }

  /** Re-read just the container dimensions. Used on resize-related attr changes. */
  static dimensions(element: HTMLElement): { width: number; height: number } {
    const containerWidth = element.clientWidth || (element as HTMLElement).offsetWidth || 800;
    const containerHeight = element.clientHeight || (element as HTMLElement).offsetHeight || 600;
    return {
      width: AttributeBinder.parseSize(element.getAttribute('width'), containerWidth),
      height: AttributeBinder.parseSize(element.getAttribute('height'), containerHeight)
    };
  }

  static parseSize(value: string | null, fallback: number): number {
    if (!value) return fallback;
    let parsed: number;
    if (value.endsWith('px')) {
      parsed = parseInt(value, 10);
    } else if (value.endsWith('%')) {
      const pct = parseInt(value, 10);
      if (isNaN(pct) || pct < 0 || pct > 100) return fallback;
      parsed = (fallback * pct) / 100;
    } else {
      parsed = parseInt(value, 10);
    }
    if (isNaN(parsed) || parsed < 0 || parsed > MAX_SIZE) return fallback;
    return parsed;
  }

  static parseNumber(value: string | null, fallback: number): number {
    if (value === null) return fallback;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  static parseTools(value: string | null): CanvasLensOptions['tools'] | undefined {
    if (!value) return undefined;
    return SecureJsonParser.parseToolConfig(value) ?? undefined;
  }
}
