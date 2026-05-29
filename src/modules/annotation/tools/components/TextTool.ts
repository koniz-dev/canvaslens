import type { Annotation, Point } from '../../../../types';
import { BaseTool } from './BaseTool';

/**
 * Placeholder for the text "tool" — text input is handled entirely by
 * `core/TextInputController`. This class exists only so the tool plugin
 * registry can register a `'text'` type and `activateTool('text')` is a
 * legal call (it sets the cursor + fires `toolChange`); the plugin
 * itself is a no-op.
 */
export class TextTool extends BaseTool {
  startDrawing(_point: Point): Annotation | null {
    return null;
  }

  continueDrawing(_point: Point): void {
    /* no-op */
  }

  finishDrawing(_point: Point): Annotation | null {
    return null;
  }

  cancelDrawing(): void {
    super.cancelDrawing();
  }

  getPreviewPoints(): Point[] {
    return [];
  }

  getType(): Annotation['type'] {
    return 'text';
  }
}
