"use client";

import { useRef } from "react";
import { RotateCw, FlipHorizontal2, FlipVertical2, ImagePlus, Trash2 } from "lucide-react";
import type { CellAssignment, UploadedImage } from "@/lib/collage/types";
import type { PxRect } from "@/lib/collage/transform";
import { clamp, computeCellGeometry, cssImageTransform, dragDeltaToPanFractionDelta } from "@/lib/collage/transform";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/collage/constants";

type Props = {
  index: number;
  box: PxRect;
  radiusPx: number;
  cell: CellAssignment;
  image: UploadedImage | undefined;
  selected: boolean;
  onSelect: () => void;
  onUpdateTransform: (partial: Partial<CellAssignment>, commit?: "immediate" | "debounced" | "none") => void;
  onRotate: () => void;
  onFlip: (axis: "h" | "v") => void;
  onReplace: () => void;
  onRemove: () => void;
  onSwap: (sourceIndex: number) => void;
  onAssignImageId: (imageId: string) => void;
  onFilesDrop: (files: FileList) => void;
};

export default function CollageCell({
  index,
  box,
  radiusPx,
  cell,
  image,
  selected,
  onSelect,
  onUpdateTransform,
  onRotate,
  onFlip,
  onReplace,
  onRemove,
  onSwap,
  onAssignImageId,
  onFilesDrop,
}: Props) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    scale: number;
    slackX: number;
    slackY: number;
    moved: boolean;
  } | null>(null);

  if (box.w <= 0 || box.h <= 0) return null;

  function handlePointerDown(e: React.PointerEvent) {
    onSelect();
    if (!image) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const geo = computeCellGeometry(box.w, box.h, image.naturalWidth, image.naturalHeight, cell.rotation, cell.zoom, cell.panX, cell.panY);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: cell.panX,
      startPanY: cell.panY,
      scale: geo.scale,
      slackX: geo.slackX,
      slackY: geo.slackY,
      moved: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.hypot(dx, dy) > 3) d.moved = true;
    const { dPanX, dPanY } = dragDeltaToPanFractionDelta(dx, dy, cell.rotation, cell.flipH, cell.flipV, d.scale, d.slackX, d.slackY);
    onUpdateTransform(
      { panX: clamp(d.startPanX + dPanX, -1, 1), panY: clamp(d.startPanY + dPanY, -1, 1) },
      "debounced",
    );
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleWheel(e: React.WheelEvent) {
    if (!image) return;
    e.preventDefault();
    const newZoom = clamp(cell.zoom - e.deltaY * 0.0015, MIN_ZOOM, MAX_ZOOM);
    onUpdateTransform({ zoom: newZoom }, "debounced");
  }

  function handleDragStart(e: React.DragEvent) {
    if (!image) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/x-cell-index", String(index));
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const srcIdx = e.dataTransfer.getData("application/x-cell-index");
    const imageId = e.dataTransfer.getData("application/x-image-id");
    if (srcIdx) {
      const src = parseInt(srcIdx, 10);
      if (!Number.isNaN(src) && src !== index) onSwap(src);
      return;
    }
    if (imageId) {
      onAssignImageId(imageId);
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDrop(e.dataTransfer.files);
    }
  }

  const geo = image
    ? computeCellGeometry(box.w, box.h, image.naturalWidth, image.naturalHeight, cell.rotation, cell.zoom, cell.panX, cell.panY)
    : null;

  return (
    <div
      data-cell-index={index}
      className={`group absolute overflow-hidden bg-ink-800 ${selected ? "ring-2 ring-accent-400" : ""}`}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radiusPx }}
      draggable={!!image}
      onDragStart={handleDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {image && geo ? (
        <img
          src={image.url}
          alt=""
          draggable={false}
          className="absolute select-none touch-none"
          style={{
            left: "50%",
            top: "50%",
            width: image.naturalWidth,
            height: image.naturalHeight,
            maxWidth: "none",
            transform: cssImageTransform(geo, cell.rotation, cell.flipH, cell.flipV),
            cursor: "grab",
          }}
        />
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReplace();
          }}
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-500 hover:text-accent-400 hover:bg-white/5"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[11px]">Add photo</span>
        </button>
      )}

      {image && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="pointer-events-auto absolute right-1 top-1 flex gap-1">
            <CellIconButton title="Rotate" onClick={onRotate}>
              <RotateCw className="h-3.5 w-3.5" />
            </CellIconButton>
            <CellIconButton title="Flip horizontal" onClick={() => onFlip("h")}>
              <FlipHorizontal2 className="h-3.5 w-3.5" />
            </CellIconButton>
            <CellIconButton title="Flip vertical" onClick={() => onFlip("v")}>
              <FlipVertical2 className="h-3.5 w-3.5" />
            </CellIconButton>
            <CellIconButton title="Replace photo" onClick={onReplace}>
              <ImagePlus className="h-3.5 w-3.5" />
            </CellIconButton>
            <CellIconButton title="Remove photo" onClick={onRemove}>
              <Trash2 className="h-3.5 w-3.5" />
            </CellIconButton>
          </div>
        </div>
      )}
    </div>
  );
}

function CellIconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-6 w-6 items-center justify-center rounded bg-black/60 text-white backdrop-blur hover:bg-accent-500"
    >
      {children}
    </button>
  );
}
