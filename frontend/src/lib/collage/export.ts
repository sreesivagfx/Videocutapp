import { CollageState, LayoutTemplate } from "./types";
import { REFERENCE_WIDTH } from "./constants";
import { cellPxRect, computeCellGeometry, drawImageInCell } from "./transform";
import {
  computeFilterString,
  getGrainTileDataUrl,
  paintGrainOnCanvas,
  paintVignetteOnCanvas,
} from "./filters";
import { paintBackgroundOnCanvas } from "./background";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export type ExportOptions = {
  longEdge: number;
  format: "png" | "jpeg";
  quality?: number;
  ratio: { w: number; h: number };
};

export async function renderCollageToCanvas(
  state: CollageState,
  layout: LayoutTemplate,
  opts: ExportOptions,
): Promise<HTMLCanvasElement> {
  const ratio = opts.ratio.w / opts.ratio.h;
  const exportW = ratio >= 1 ? opts.longEdge : Math.round(opts.longEdge * ratio);
  const exportH = ratio >= 1 ? Math.round(opts.longEdge / ratio) : opts.longEdge;
  const scaleFactor = exportW / REFERENCE_WIDTH;

  const canvas = document.createElement("canvas");
  canvas.width = exportW;
  canvas.height = exportH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const imageMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    state.images.map(async (img) => {
      try {
        imageMap.set(img.id, await loadImage(img.url));
      } catch {
        // Skip images that fail to (re)load.
      }
    }),
  );

  // ---- base pass: background + cropped photos, unfiltered ----
  const base = document.createElement("canvas");
  base.width = exportW;
  base.height = exportH;
  const bctx = base.getContext("2d");
  if (!bctx) throw new Error("Canvas 2D context unavailable");

  paintBackgroundOnCanvas(bctx, exportW, exportH, state.border.bg);

  const frameWidthPx = state.border.frameWidth * scaleFactor;
  const contentX = frameWidthPx;
  const contentY = frameWidthPx;
  const contentW = exportW - frameWidthPx * 2;
  const contentH = exportH - frameWidthPx * 2;
  const gapPx = state.border.gap * scaleFactor;
  const radiusPx = state.border.radius * scaleFactor;

  layout.cells.forEach((rect, i) => {
    const cell = state.cells[i];
    const box = cellPxRect(rect, contentX, contentY, contentW, contentH, gapPx);
    if (box.w <= 0 || box.h <= 0) return;

    bctx.save();
    roundedRectPath(bctx, box.x, box.y, box.w, box.h, radiusPx);
    bctx.clip();

    const img = cell?.imageId ? imageMap.get(cell.imageId) : undefined;
    if (img) {
      const geo = computeCellGeometry(
        box.w,
        box.h,
        img.naturalWidth,
        img.naturalHeight,
        cell.rotation,
        cell.zoom,
        cell.panX,
        cell.panY,
      );
      drawImageInCell(
        bctx,
        img,
        img.naturalWidth,
        img.naturalHeight,
        box.x,
        box.y,
        box.w,
        box.h,
        geo,
        cell.rotation,
        cell.flipH,
        cell.flipV,
      );
    } else {
      bctx.fillStyle = "#1b2333";
      bctx.fillRect(box.x, box.y, box.w, box.h);
    }
    bctx.restore();
  });

  // ---- composite base through the adjustment filter ----
  ctx.save();
  ctx.filter = computeFilterString(state.adjust);
  ctx.drawImage(base, 0, 0);
  ctx.restore();

  // ---- crisp overlays: vignette + grain (not affected by blur/hue etc.) ----
  paintVignetteOnCanvas(ctx, exportW, exportH, state.adjust.vignette);
  if (state.adjust.grain > 0) {
    try {
      const tile = await loadImage(getGrainTileDataUrl());
      paintGrainOnCanvas(ctx, exportW, exportH, state.adjust.grain, tile);
    } catch {
      // ignore grain failures
    }
  }

  // ---- text / emoji layers, always crisp ----
  for (const t of state.texts) {
    const fontPx = t.fontSize * scaleFactor;
    ctx.save();
    ctx.font = `${t.fontWeight} ${fontPx}px ${t.fontFamily}`;
    ctx.textAlign = t.align;
    ctx.textBaseline = "middle";
    const x = (t.x / 100) * exportW;
    const y = (t.y / 100) * exportH;
    if (t.bg) {
      const metrics = ctx.measureText(t.text);
      const padX = fontPx * 0.35;
      const padY = fontPx * 0.25;
      let boxX = x - padX;
      if (t.align === "center") boxX = x - metrics.width / 2 - padX;
      if (t.align === "right") boxX = x - metrics.width - padX;
      ctx.fillStyle = t.bg;
      roundedRectPath(ctx, boxX, y - fontPx / 2 - padY, metrics.width + padX * 2, fontPx + padY * 2, fontPx * 0.15);
      ctx.fill();
    }
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, x, y);
    ctx.restore();
  }

  return canvas;
}

export async function exportCollage(state: CollageState, layout: LayoutTemplate, opts: ExportOptions) {
  const canvas = await renderCollageToCanvas(state, layout, opts);
  const mime = opts.format === "png" ? "image/png" : "image/jpeg";
  const quality = opts.format === "jpeg" ? (opts.quality ?? 0.92) : undefined;
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error("Failed to export image");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
