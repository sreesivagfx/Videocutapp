"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";

export default function PhotosPanel({ editor }: { editor: CollageEditor }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function assignedCellIndex(imageId: string) {
    return editor.state.cells.findIndex((c) => c.imageId === imageId);
  }

  function handlePick(imageId: string) {
    if (editor.selectedCellIndex !== null) {
      editor.assignImageToCell(editor.selectedCellIndex, imageId);
      return;
    }
    const emptyIdx = editor.state.cells.findIndex((c) => !c.imageId);
    if (emptyIdx >= 0) editor.assignImageToCell(emptyIdx, imageId);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) editor.addImages(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) editor.addImages(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition-colors ${
          dragOver ? "border-accent-400 bg-accent-500/10 text-accent-300" : "border-surface-border text-slate-400 hover:border-accent-500/50"
        }`}
      >
        <Upload className="h-5 w-5" />
        Add photos
        <span className="text-[11px] text-slate-500">Click or drag &amp; drop images</span>
      </button>

      {editor.state.images.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">
            Your photos ({editor.state.images.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {editor.state.images.map((img) => {
              const inUse = assignedCellIndex(img.id) >= 0;
              return (
                <div
                  key={img.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-image-id", img.id);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => handlePick(img.id)}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-md border ${
                    inUse ? "border-accent-400/60" : "border-surface-border"
                  }`}
                  title={img.name}
                >
                  <img src={img.url} alt={img.name} className="h-full w-full object-cover" draggable={false} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.removeImage(img.id);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100"
                    title="Delete photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Drag a photo onto any cell, or select a cell then click a photo to place it.
          </p>
        </div>
      )}
    </div>
  );
}
