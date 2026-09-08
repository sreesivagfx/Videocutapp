"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { TextLayer } from "@/lib/collage/types";

type Props = {
  layer: TextLayer;
  containerW: number;
  containerH: number;
  scaleFactor: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (partial: Partial<TextLayer>, commit?: "immediate" | "debounced" | "none") => void;
  onRemove: () => void;
};

export default function TextLayerView({
  layer,
  containerW,
  containerH,
  scaleFactor,
  selected,
  onSelect,
  onUpdate,
  onRemove,
}: Props) {
  const dragRef = useRef<{ startX: number; startY: number; startXPct: number; startYPct: number } | null>(null);
  const [editing, setEditing] = useState(false);

  function handlePointerDown(e: React.PointerEvent) {
    if (editing) return;
    onSelect();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startXPct: layer.x, startYPct: layer.y };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dxPct = ((e.clientX - d.startX) / containerW) * 100;
    const dyPct = ((e.clientY - d.startY) / containerH) * 100;
    onUpdate(
      { x: Math.min(100, Math.max(0, d.startXPct + dxPct)), y: Math.min(100, Math.max(0, d.startYPct + dyPct)) },
      "debounced",
    );
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  const fontPx = layer.fontSize * scaleFactor;

  return (
    <div
      className={`absolute ${selected ? "outline outline-2 outline-accent-400" : ""}`}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: "translate(-50%, -50%)",
        cursor: editing ? "text" : "grab",
        padding: fontPx * 0.15,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      <div
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={(e) => {
          setEditing(false);
          onUpdate({ text: e.currentTarget.textContent || layer.text }, "immediate");
        }}
        style={{
          fontSize: fontPx,
          color: layer.color,
          fontFamily: layer.fontFamily,
          fontWeight: layer.fontWeight,
          textAlign: layer.align,
          background: layer.bg ?? "transparent",
          whiteSpace: "pre",
          userSelect: editing ? "text" : "none",
          outline: "none",
          lineHeight: 1.1,
        }}
      >
        {layer.text}
      </div>
      {selected && !editing && (
        <button
          type="button"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
