export type Rect = { x: number; y: number; w: number; h: number }; // percent 0-100

export type LayoutTemplate = {
  id: string;
  name: string;
  count: number;
  cells: Rect[];
};

export type RatioPreset = {
  id: string;
  label: string;
  group: string;
  w: number;
  h: number;
};

export type UploadedImage = {
  id: string;
  url: string;
  naturalWidth: number;
  naturalHeight: number;
  name: string;
};

export type CellAssignment = {
  imageId: string | null;
  zoom: number;
  panX: number; // -1..1 fraction of available slack
  panY: number; // -1..1 fraction of available slack
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
};

export type AdjustState = {
  brightness: number; // 50-150, 100 = normal
  contrast: number; // 50-150
  saturation: number; // 0-200
  warmth: number; // -50..50
  hue: number; // -180..180
  grayscale: number; // 0-100
  sepia: number; // 0-100
  blur: number; // 0-8 px
  sharpen: number; // 0-100 (folds into contrast)
  vignette: number; // 0-100
  grain: number; // 0-100
};

export type BorderState = {
  gap: number; // px at REFERENCE_WIDTH
  radius: number; // px at REFERENCE_WIDTH
  frameWidth: number; // outer frame padding, px at REFERENCE_WIDTH
  bg: string; // css color / gradient
};

export type TextLayer = {
  id: string;
  kind: "text" | "emoji";
  text: string;
  x: number; // percent 0-100, center
  y: number; // percent 0-100, center
  fontSize: number; // px at REFERENCE_WIDTH
  color: string;
  fontFamily: string;
  fontWeight: number;
  align: "left" | "center" | "right";
  bg: string | null; // optional highlight background behind text
};

export type CollageState = {
  ratioId: string;
  customRatio: { w: number; h: number } | null;
  layoutId: string;
  images: UploadedImage[];
  cells: CellAssignment[];
  adjust: AdjustState;
  border: BorderState;
  texts: TextLayer[];
  filterPresetId: string;
};

export const DEFAULT_ADJUST: AdjustState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  hue: 0,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  sharpen: 0,
  vignette: 0,
  grain: 0,
};

export const DEFAULT_BORDER: BorderState = {
  gap: 8,
  radius: 12,
  frameWidth: 0,
  bg: "#0F1420",
};

export function makeCell(): CellAssignment {
  return {
    imageId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
  };
}
