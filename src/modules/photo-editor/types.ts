export interface PhotoEditorOptions {
  enabled?: boolean;
  tools?: PhotoEditorTool[];
  defaultTool?: PhotoEditorTool;
  theme?: 'light' | 'dark';
  position?: 'right' | 'left' | 'bottom';
  width?: number;
  height?: number;
}

export type PhotoEditorTool = 'light' | 'color' | 'retouching' | 'effects' | 'info';

export interface AdjustmentValue {
  brightness: number;
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  vignette: number;
}

export interface ColorAdjustment {
  saturation: number;
  temperature: number;
  tint: number;
  vibrance: number;
}

export interface PhotoEditorState {
  isOpen: boolean;
  currentTool: PhotoEditorTool;
  adjustments: AdjustmentValue;
  colorAdjustments: ColorAdjustment;
  originalImageData: ImageData | null;
  modifiedImageData: ImageData | null;
}

export interface ToolConfig {
  id: PhotoEditorTool;
  name: string;
  icon: string;
  adjustments: string[];
}

export interface SliderConfig {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  icon: string;
}
