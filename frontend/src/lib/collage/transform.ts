// Geometry shared by the interactive DOM preview (CollageCanvas) and the
// canvas export pipeline (export.ts). Both build the exact same transform
// from the same inputs so the exported image matches what the user sees.
//
// Order of operations for placing an image inside a cell, read innermost
// first (this matches the CSS transform function list applied right-to-left):
//   1. translate by the pan offset, in the image's own (unrotated) pixel space
//   2. scale to "cover" the cell (times the user zoom), flipping axes if needed
//   3. rotate by 0/90/180/270
//   4. translate to the cell's center
export type CellGeometry = {
  scale: number;
  slackX: number; // local px of extra image beyond the cell on the local x-axis
  slackY: number;
  offsetX: number; // local px translate actually applied (pan fraction * slack/2)
  offsetY: number;
};

export function computeCellGeometry(
  cellW: number,
  cellH: number,
  imgW: number,
  imgH: number,
  rotation: number,
  zoom: number,
  panX: number,
  panY: number,
): CellGeometry {
  const rot90 = rotation % 180 !== 0;
  const boundW = rot90 ? imgH : imgW;
  const boundH = rot90 ? imgW : imgH;
  const scale0 = Math.max(cellW / boundW, cellH / boundH, 1e-6);
  const scale = scale0 * zoom;

  const screenDimForLocalX = rot90 ? cellH : cellW;
  const screenDimForLocalY = rot90 ? cellW : cellH;
  const slackX = Math.max(0, imgW - screenDimForLocalX / scale);
  const slackY = Math.max(0, imgH - screenDimForLocalY / scale);

  const offsetX = clamp(panX, -1, 1) * (slackX / 2);
  const offsetY = clamp(panY, -1, 1) * (slackY / 2);

  return { scale, slackX, slackY, offsetX, offsetY };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// CSS transform string for the <img>, positioned with top:50%; left:50%;
// width/height = natural image px.
export function cssImageTransform(
  geo: CellGeometry,
  rotation: number,
  flipH: boolean,
  flipY: boolean,
): string {
  const sx = (flipH ? -1 : 1) * geo.scale;
  const sy = (flipY ? -1 : 1) * geo.scale;
  return `translate(-50%, -50%) rotate(${rotation}deg) scale(${sx}, ${sy}) translate(${geo.offsetX}px, ${geo.offsetY}px)`;
}

// Draws one image into a cell on a canvas 2D context, mirroring cssImageTransform.
export function drawImageInCell(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  imgW: number,
  imgH: number,
  cellX: number,
  cellY: number,
  cellW: number,
  cellH: number,
  geo: CellGeometry,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(cellX, cellY, cellW, cellH);
  ctx.clip();
  ctx.translate(cellX + cellW / 2, cellY + cellH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale((flipH ? -1 : 1) * geo.scale, (flipV ? -1 : 1) * geo.scale);
  ctx.translate(geo.offsetX, geo.offsetY);
  ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
  ctx.restore();
}

// Converts a screen-space pointer drag delta into a change in pan fraction,
// accounting for rotation/flip so dragging always feels intuitive.
export function dragDeltaToPanFractionDelta(
  dxScreen: number,
  dyScreen: number,
  rotation: number,
  flipH: boolean,
  flipV: boolean,
  scale: number,
  slackX: number,
  slackY: number,
): { dPanX: number; dPanY: number } {
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let dlx = (dxScreen * cos - dyScreen * sin) / scale;
  let dly = (dxScreen * sin + dyScreen * cos) / scale;
  if (flipH) dlx = -dlx;
  if (flipV) dly = -dly;
  const dPanX = slackX > 0 ? dlx / (slackX / 2) : 0;
  const dPanY = slackY > 0 ? dly / (slackY / 2) : 0;
  return { dPanX, dPanY };
}

export type PxRect = { x: number; y: number; w: number; h: number };

// Pixel rect of one cell's clipped "frame" (after gap inset), given the
// layout's percent rect and the content box it lives inside. Used by both
// the live DOM preview and the canvas export so geometry always matches.
export function cellPxRect(
  rect: { x: number; y: number; w: number; h: number },
  contentX: number,
  contentY: number,
  contentW: number,
  contentH: number,
  gapPx: number,
): PxRect {
  const wrapperX = contentX + (rect.x / 100) * contentW;
  const wrapperY = contentY + (rect.y / 100) * contentH;
  const wrapperW = (rect.w / 100) * contentW;
  const wrapperH = (rect.h / 100) * contentH;
  return {
    x: wrapperX + gapPx / 2,
    y: wrapperY + gapPx / 2,
    w: Math.max(0, wrapperW - gapPx),
    h: Math.max(0, wrapperH - gapPx),
  };
}

export function fitRectInBounds(
  targetW: number,
  targetH: number,
  ratioW: number,
  ratioH: number,
): { w: number; h: number } {
  const ratio = ratioW / ratioH;
  if (targetW / targetH > ratio) {
    return { w: targetH * ratio, h: targetH };
  }
  return { w: targetW, h: targetW / ratio };
}
