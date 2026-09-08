import type { AdjustState } from "./types";
import { DEFAULT_ADJUST } from "./types";

// Builds one CSS filter string used verbatim as both the DOM preview's
// `filter` style AND the export canvas's `ctx.filter` (same syntax in both),
// so preview and export always match exactly.
export function computeFilterString(a: AdjustState): string {
  const effectiveContrast = clampPct(a.contrast + a.sharpen * 0.5);
  const warmHue = a.warmth < 0 ? a.warmth * 1.1 : 0; // cool: rotate toward blue
  const warmSepia = a.warmth > 0 ? a.warmth * 0.6 : 0; // warm: add a little sepia

  const parts = [
    `brightness(${clampPct(a.brightness)}%)`,
    `contrast(${effectiveContrast}%)`,
    `saturate(${clampPct(a.saturation, 0, 300)}%)`,
    `grayscale(${clampPct(a.grayscale, 0, 100)}%)`,
    `sepia(${clampPct(a.sepia + warmSepia, 0, 100)}%)`,
    `hue-rotate(${a.hue + warmHue}deg)`,
  ];
  if (a.blur > 0) parts.push(`blur(${a.blur}px)`);
  return parts.join(" ");
}

function clampPct(v: number, min = 0, max = 200): number {
  return Math.max(min, Math.min(max, v));
}

export type FilterPreset = {
  id: string;
  name: string;
  adjust: Partial<AdjustState>;
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "original", name: "Original", adjust: {} },
  { id: "vivid", name: "Vivid", adjust: { saturation: 140, contrast: 110 } },
  { id: "warm", name: "Warm", adjust: { warmth: 25, brightness: 104 } },
  { id: "cool", name: "Cool", adjust: { warmth: -25, saturation: 105 } },
  { id: "noir", name: "Noir", adjust: { grayscale: 100, contrast: 118, brightness: 98 } },
  { id: "mono", name: "Mono", adjust: { grayscale: 100 } },
  {
    id: "vintage",
    name: "Vintage",
    adjust: { sepia: 35, contrast: 92, warmth: 12, vignette: 25, grain: 18 },
  },
  { id: "sepia-tone", name: "Sepia", adjust: { sepia: 80, contrast: 95 } },
  { id: "fade", name: "Fade", adjust: { contrast: 80, brightness: 112, saturation: 82 } },
  { id: "chrome", name: "Chrome", adjust: { contrast: 122, saturation: 130 } },
  {
    id: "dramatic",
    name: "Dramatic",
    adjust: { contrast: 128, saturation: 62, vignette: 35 },
  },
  { id: "soft", name: "Soft", adjust: { brightness: 107, contrast: 92, saturation: 95 } },
  { id: "moody", name: "Moody", adjust: { contrast: 112, saturation: 78, warmth: -12, vignette: 30 } },
  { id: "sunkissed", name: "Sun-kissed", adjust: { warmth: 30, saturation: 118, brightness: 106 } },
];

export function applyPreset(preset: FilterPreset): AdjustState {
  return { ...DEFAULT_ADJUST, ...preset.adjust };
}

// A small tileable noise pattern, generated once and reused for both the
// live-preview overlay (as a CSS background-image data URL) and the export
// canvas (drawn as a repeating pattern) — same source, so grain matches.
let cachedGrainUrl: string | null = null;

export function getGrainTileDataUrl(size = 128): string {
  if (cachedGrainUrl) return cachedGrainUrl;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const imageData = ctx.createImageData(size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    imageData.data[i] = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  cachedGrainUrl = canvas.toDataURL();
  return cachedGrainUrl;
}

// Shared vignette math so the CSS radial-gradient (preview) and the canvas
// gradient (export) darken by the same amount at the same radius.
export function vignetteStops(vignette: number): { innerStopPct: number; alpha: number } {
  const v = clampPct(vignette, 0, 100);
  return { innerStopPct: Math.max(5, 100 - v * 0.7), alpha: (v / 100) * 0.85 };
}

export function buildVignetteCss(w: number, h: number, vignette: number): string {
  if (vignette <= 0) return "none";
  const { innerStopPct, alpha } = vignetteStops(vignette);
  const radius = (Math.hypot(w, h) / 2) * 1.05;
  return `radial-gradient(circle ${radius}px at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${innerStopPct}%, rgba(0,0,0,${alpha}) 100%)`;
}

export function paintVignetteOnCanvas(ctx: CanvasRenderingContext2D, w: number, h: number, vignette: number) {
  if (vignette <= 0) return;
  const { innerStopPct, alpha } = vignetteStops(vignette);
  const radius = (Math.hypot(w, h) / 2) * 1.05;
  const cx = w / 2;
  const cy = h / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(innerStopPct / 100, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${alpha})`);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function paintGrainOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  grain: number,
  tileImg: CanvasImageSource,
) {
  if (grain <= 0) return;
  const pattern = ctx.createPattern(tileImg, "repeat");
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = clampPct(grain, 0, 100) / 100;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
