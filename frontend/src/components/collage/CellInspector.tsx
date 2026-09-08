"use client";

import { FlipHorizontal2, FlipVertical2, RotateCw, Trash2, X, ZoomIn } from "lucide-react";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/collage/constants";

export default function CellInspector({ editor }: { editor: CollageEditor }) {
  if (editor.selectedCellIndex === null) return null;
  const i = editor.selectedCellIndex;
  const cell = editor.state.cells[i];
  if (!cell?.imageId) return null;

  return (
    <div className="flex items-center gap-3 border-t border-surface-border bg-ink-950/80 px-6 py-2.5">
      <span className="text-xs font-medium text-slate-400">Photo {i + 1}</span>
      <ZoomIn className="h-4 w-4 text-slate-500" />
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.01}
        value={cell.zoom}
        onChange={(e) => editor.updateCellTransform(i, { zoom: parseFloat(e.target.value) }, "debounced")}
        className="w-40 accent-accent-500"
      />
      <button
        onClick={() => editor.rotateCell(i)}
        title="Rotate"
        className="rounded-md border border-surface-border p-1.5 text-slate-300 hover:text-white"
      >
        <RotateCw className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => editor.flipCell(i, "h")}
        title="Flip horizontal"
        className="rounded-md border border-surface-border p-1.5 text-slate-300 hover:text-white"
      >
        <FlipHorizontal2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => editor.flipCell(i, "v")}
        title="Flip vertical"
        className="rounded-md border border-surface-border p-1.5 text-slate-300 hover:text-white"
      >
        <FlipVertical2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => editor.resetCellTransform(i)}
        className="rounded-md border border-surface-border px-2.5 py-1.5 text-xs text-slate-300 hover:text-white"
      >
        Reset
      </button>
      <button
        onClick={() => editor.assignImageToCell(i, null)}
        title="Remove photo"
        className="ml-auto rounded-md border border-surface-border p-1.5 text-slate-300 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => editor.setSelectedCellIndex(null)}
        title="Deselect"
        className="rounded-md border border-surface-border p-1.5 text-slate-300 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
